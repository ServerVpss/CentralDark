module.exports = [
"[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isAutomatedTestProcess",
    ()=>isAutomatedTestProcess,
    "isBuildProcess",
    ()=>isBuildProcess
]);
/**
 * "Am I running under an automated test runner?" — one answer, one place.
 *
 * Eleven subsystems each carried their own copy of this check, and every copy decided it with
 * `process.argv.some((arg) => arg.includes("test"))`. That substring test is wrong in a way that is
 * easy to miss and expensive to hit: `'latest'.includes('test') === true`. Any argv carrying a
 * `latest` segment — a release symlink (`/opt/app/latest/server.js`), an npm/npx cache path, a
 * `--model=latest` flag — silently flipped the process into "test mode", and the subsystems gated on
 * it turned themselves off without a word. The worst of them is `src/lib/db/backup.ts`:
 * `isSqliteAutoBackupDisabled()` returns true, so SQLite auto-backup simply never runs. Same class of
 * silent disable for migrations, cloud sync, the health checks and quota recovery.
 *
 * Matching rules:
 *  - env first (`NODE_ENV=test`, `VITEST`) — unchanged behaviour.
 *  - argv: `test`/`tests` only as a WHOLE token delimited by a path separator, dot or dash — so
 *    `--test`, `tests/unit/x.test.ts` and `src/x.test.ts` match, while `latest`, `protest`,
 *    `contest` and `attestation` do not.
 *  - argv: known runner binaries (vitest/jest/mocha/ava/tap), which have no delimiter before "test".
 *
 * argv and env are parameters rather than globals so the behaviour is testable: under a test runner
 * the globals always say "test", which is exactly why the substring bug could never be caught.
 */ /** `test`/`tests` as a whole token: `--test`, `/tests/`, `.test.ts` — but never `latest`/`protest`. */ const TEST_TOKEN_RE = /(^|[\\/.-])tests?([\\/.-]|$)/i;
/** Runner binaries: no delimiter precedes "test" in "vitest", so they need their own rule. */ const TEST_RUNNER_RE = /(^|[\\/])(vitest|jest|mocha|ava|tap)(\.[cm]?js)?$/i;
function isAutomatedTestProcess(// execArgv too: `node --test x.js` puts `--test` in execArgv, not argv (modelLockoutSettings was the
// only copy that remembered to look there — now every caller gets it).
argv = typeof process !== "undefined" ? [
    ...process.argv,
    ...process.execArgv
] : [], env = typeof process !== "undefined" ? process.env : {}) {
    if (env.NODE_ENV === "test") return true;
    if (env.VITEST !== undefined) return true;
    // Defensive: tolerate a non-array argv (e.g. a caller passing arguments out
    // of order) instead of throwing `argv.some is not a function` — this check
    // gates production behavior (auto-backup, migrations, cloud sync…), so it
    // must never crash the process it's protecting.
    if (!Array.isArray(argv)) return false;
    return argv.some((arg)=>typeof arg === "string" && (TEST_TOKEN_RE.test(arg) || TEST_RUNNER_RE.test(arg)));
}
function isBuildProcess(env = process.env) {
    return typeof process !== "undefined" && env.NEXT_PHASE === "phase-production-build";
}
}),
"[project]/src/shared/constants/featureFlagDefinitions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FEATURE_FLAG_DEFINITIONS",
    ()=>FEATURE_FLAG_DEFINITIONS
]);
const FEATURE_FLAG_DEFINITIONS = [
    // ──────────────── Security (9) ────────────────
    {
        key: "REQUIRE_API_KEY",
        label: "Require API Key",
        description: "Require an API key for all incoming requests",
        descriptionI18nKey: "featureFlagRequireApiKeyDescription",
        category: "security",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "INPUT_SANITIZER_ENABLED",
        label: "Input Sanitizer",
        description: "Enable input sanitization for all requests",
        descriptionI18nKey: "featureFlagInputSanitizerEnabledDescription",
        category: "security",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "INJECTION_GUARD_MODE",
        label: "Injection Guard Mode",
        description: "Set the prompt injection guard mode",
        descriptionI18nKey: "featureFlagInjectionGuardModeDescription",
        category: "security",
        defaultValue: "off",
        type: "enum",
        enumValues: [
            "off",
            "warn",
            "block",
            "redact"
        ],
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "PII_REDACTION_ENABLED",
        label: "PII Redaction",
        description: "Redact personally identifiable information from requests",
        descriptionI18nKey: "featureFlagPiiRedactionEnabledDescription",
        category: "security",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "PII_RESPONSE_SANITIZATION",
        label: "PII Response Sanitization",
        description: "Sanitize PII from provider responses",
        descriptionI18nKey: "featureFlagPiiResponseSanitizationDescription",
        category: "security",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "PII_RESPONSE_SANITIZATION_MODE",
        label: "PII Response Sanitization Mode",
        description: "Mode for PII response sanitization: redact (replace PII), warn (log only), block (reject), off (disable)",
        descriptionI18nKey: "featureFlagPiiResponseSanitizationModeDescription",
        category: "security",
        defaultValue: "redact",
        type: "enum",
        enumValues: [
            "redact",
            "warn",
            "block",
            "off"
        ],
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OUTBOUND_SSRF_GUARD_ENABLED",
        label: "SSRF Guard",
        description: "Block outbound requests to private/internal IP ranges",
        descriptionI18nKey: "featureFlagOutboundSsrfGuardEnabledDescription",
        category: "security",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "ALLOW_API_KEY_REVEAL",
        label: "API Key Reveal",
        description: "Allow authenticated dashboard users to reveal stored API keys instead of only seeing masked values.",
        descriptionI18nKey: "featureFlagAllowApiKeyRevealDescription",
        category: "security",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "danger"
    },
    // ──────────────── Network (7) ────────────────
    {
        key: "ENABLE_TLS_FINGERPRINT",
        label: "TLS Fingerprint",
        description: "Enable TLS fingerprint stealth mode",
        descriptionI18nKey: "featureFlagEnableTlsFingerprintDescription",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "info"
    },
    {
        key: "AUDIO_REMOTE_PROVIDER_NODES",
        label: "Remote Audio Provider Nodes",
        description: "Allow the /v1/audio/* routes to use OpenAI-compatible provider nodes hosted outside localhost. Off by default — routing audio to a remote host changes egress identity and must be an explicit operator decision. Loopback nodes are always allowed and unaffected.",
        descriptionI18nKey: "settings.featureFlags.audioRemoteProviderNodes",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "danger"
    },
    {
        key: "ONEPROXY_ENABLED",
        label: "OneProxy Enabled",
        description: "Enable 1proxy request proxying.",
        descriptionI18nKey: "settings.featureFlags.oneproxyEnabled",
        category: "network",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "PROXY_AUTO_SELECT_ENABLED",
        label: "Proxy Auto-Selection Fallback",
        description: "When no proxy is assigned to a connection, auto-select the first working proxy from the registry. Off by default — otherwise any single registry proxy becomes a global fallback for all traffic (#3332).",
        descriptionI18nKey: "settings.featureFlags.proxyAutoSelectEnabled",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_CONTROL_PLANE_PROXY_DIRECT_FALLBACK",
        label: "Control-Plane Proxy Direct Fallback",
        description: "Allow OAuth and provider validation flows to bypass a pinned proxy and connect directly when proxy reachability pre-checks fail. Off by default because this can change account egress IP.",
        descriptionI18nKey: "featureFlagOmnirouteControlPlaneProxyDirectFallbackDescription",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "danger"
    },
    {
        key: "MITM_DISABLE_TLS_VERIFY",
        label: "Disable TLS Verify (MITM)",
        description: "Disable TLS certificate verification for MITM proxy",
        descriptionI18nKey: "featureFlagMitmDisableTlsVerifyDescription",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "danger"
    },
    {
        key: "OMNIROUTE_ALLOW_PRIVATE_PROVIDER_URLS",
        label: "Allow Private Provider URLs",
        description: "Allow provider URLs pointing to private/internal networks",
        descriptionI18nKey: "featureFlagOmnirouteAllowPrivateProviderUrlsDescription",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_ALLOW_LOCAL_PROVIDER_URLS",
        label: "Allow Local Provider URLs",
        description: "Allow adding and validating providers on local/private addresses (127.0.0.1, localhost, LAN, private IP ranges) — needed for local OpenAI-compatible models. Enabled by default (OmniRoute is local-first); turn it OFF to enforce strict public-only blocking if you only use public providers. Cloud-metadata endpoints (e.g. 169.254.169.254) stay blocked either way.",
        descriptionI18nKey: "featureFlagOmnirouteAllowLocalProviderUrlsDescription",
        category: "network",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "ENABLE_CC_COMPATIBLE_PROVIDER",
        label: "CC Compatible Provider",
        description: "Enable Claude Code compatible provider mode",
        descriptionI18nKey: "featureFlagEnableCcCompatibleProviderDescription",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "info"
    },
    // ──────────────── Policies (4) ────────────────
    {
        key: "TOOL_POLICY_MODE",
        label: "Tool Policy Mode",
        description: "Set the tool use policy enforcement mode",
        descriptionI18nKey: "featureFlagToolPolicyModeDescription",
        category: "policies",
        defaultValue: "disabled",
        type: "enum",
        enumValues: [
            "disabled",
            "warn",
            "block"
        ],
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "RATE_LIMIT_AUTO_ENABLE",
        label: "Rate Limit Auto-Enable",
        description: "Automatically enable rate limiting based on usage patterns",
        descriptionI18nKey: "featureFlagRateLimitAutoEnableDescription",
        category: "policies",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "ALLOW_MULTI_CONNECTIONS_PER_COMPAT_NODE",
        label: "Multi Connections per Compat Node",
        description: "Allow multiple connections per compatibility node",
        descriptionI18nKey: "featureFlagAllowMultiConnectionsPerCompatNodeDescription",
        category: "policies",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "info"
    },
    {
        key: "RADAR_ENABLED",
        label: "Radar",
        description: "Enable the OmniRoute Radar module (catalog feed screens and sync). Off by default; enabling only unlocks the UI — data sync remains a separate opt-in.",
        descriptionI18nKey: "featureFlagRadarEnabledDescription",
        category: "policies",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    // ──────────────── Runtime (16) ────────────────
    {
        key: "RESPONSES_PASSTHROUGH_DROP_COMMENTARY",
        label: "Drop Responses Commentary",
        description: "Drop internal commentary-phase output items from Responses API passthrough streams before forwarding to clients. Disable to receive raw upstream commentary.",
        descriptionI18nKey: "featureFlagResponsesPassthroughDropCommentaryDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_MCP_ENFORCE_SCOPES",
        label: "MCP Enforce Scopes",
        description: "Enforce scope restrictions on MCP tool access",
        descriptionI18nKey: "featureFlagOmnirouteMcpEnforceScopesDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_MCP_COMPRESS_DESCRIPTIONS",
        label: "MCP Compress Descriptions",
        description: "Compress MCP tool descriptions to reduce token usage",
        descriptionI18nKey: "featureFlagOmnirouteMcpCompressDescriptionsDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_ENABLE_RUNTIME_BACKGROUND_TASKS",
        label: "Runtime Background Tasks",
        description: "Enable background task processing at runtime",
        descriptionI18nKey: "featureFlagOmnirouteEnableRuntimeBackgroundTasksDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_DISABLE_BACKGROUND_SERVICES",
        label: "Disable Background Services",
        description: "Disable all background services (quota refresh, sync, etc)",
        descriptionI18nKey: "featureFlagOmnirouteDisableBackgroundServicesDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_RTK_TRUST_PROJECT_FILTERS",
        label: "RTK Trust Project Filters",
        description: "Trust project-level filters from RTK without validation",
        descriptionI18nKey: "featureFlagOmnirouteRtkTrustProjectFiltersDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_ENABLE_LIVE_WS",
        label: "Live Dashboard WebSocket",
        description: "Start the real-time dashboard WebSocket server on import (port 20132, loopback-bound by default). Default: enabled. Set to '0' or 'false' to disable. LAN exposure requires LIVE_WS_HOST=0.0.0.0 + LIVE_WS_ALLOWED_ORIGINS.",
        descriptionI18nKey: "featureFlagOmnirouteEnableLiveWsDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_CODEX_WS_ENABLED",
        label: "Codex Responses WebSocket",
        description: "Allow Codex to use the Responses-over-WebSocket transport (the codex CLI WS endpoint and codexTransport=websocket). When off, Codex falls back to HTTP Responses.",
        descriptionI18nKey: "featureFlagOmnirouteCodexWsEnabledDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_EMERGENCY_FALLBACK",
        label: "Emergency Fallback",
        description: "Route budget-exhausted requests to the emergency free fallback provider/model.",
        descriptionI18nKey: "featureFlagOmnirouteEmergencyFallbackDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "STREAM_RECOVERY_ENABLED",
        label: "Stream Recovery",
        description: "Enable transparent early retry for truncated upstream SSE streams before any response bytes reach the client.",
        descriptionI18nKey: "featureFlagStreamRecoveryEnabledDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "STREAM_RECOVERY_MIDSTREAM_ENABLED",
        label: "Mid-Stream Continuation",
        description: "Allow stream recovery to re-request and stitch a response after bytes have already reached the client.",
        descriptionI18nKey: "featureFlagStreamRecoveryMidstreamEnabledDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "danger"
    },
    {
        key: "MODEL_CATALOG_INCLUDE_NAMES",
        label: "Model Catalog Names",
        description: "Include display-friendly name fields in /v1/models responses. Disable for clients that expect model IDs only.",
        descriptionI18nKey: "settings.featureFlags.modelCatalogIncludeNames",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "MODELS_CATALOG_PREFIX_MODE",
        label: "Models Catalog Prefix Mode",
        description: "Controls how model IDs are prefixed in /v1/models. 'dual' (default) emits both alias and canonical provider-id prefixes for backward compatibility. 'alias' emits only the short alias prefix (e.g. ds-web/model, not deepseek-web/model). 'canonical' emits only the full provider-id prefix.",
        descriptionI18nKey: "featureFlagModelsCatalogPrefixModeDescription",
        category: "runtime",
        defaultValue: "dual",
        type: "enum",
        enumValues: [
            "dual",
            "alias",
            "canonical"
        ],
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "ARENA_ELO_SYNC_ENABLED",
        label: "Arena ELO Sync",
        description: "Enable periodic Arena AI leaderboard ELO sync for model intelligence rankings.",
        descriptionI18nKey: "featureFlagArenaEloSyncEnabledDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "EXPOSE_CC_DISCOVERY_ALIASES",
        label: "Claude Code Discovery Aliases",
        description: "Advertise claude/<provider>/<model> mirror ids on /v1/models so Claude Code gateway model discovery lists non-Claude models. Warning: doubles catalog entries for all clients when enabled globally.",
        descriptionI18nKey: "featureFlagExposeCcDiscoveryAliasesDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "EXPOSE_FUNCTIONAL_GATEWAY_MIRRORS",
        label: "Functional Gateway Mirrors",
        description: "Advertise <gateway-alias>/<model> mirror ids on /v1/models for models whose canonical owner has no active credential but a passthrough gateway with an active credential routes them. Warning: adds catalog entries for all clients when enabled globally.",
        descriptionI18nKey: "featureFlagExposeFunctionalGatewayMirrorsDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "NEWAPI_AGGREGATOR_BALANCE",
        label: "New-API Aggregator Balance",
        description: "Enable balance detection for New-API / One-API / Sub2API aggregator compatible nodes. When enabled, compatible nodes with the aggregator flag set will report their balance in the dashboard and quota-preflight routing.",
        descriptionI18nKey: "featureFlagNewApiAggregatorBalanceDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    // ──────────────── CLI (5) ────────────────
    {
        key: "CLI_COMPAT_ALL",
        label: "CLI Compat All",
        description: "Enable compatibility mode for all CLI clients",
        descriptionI18nKey: "featureFlagCliCompatAllDescription",
        category: "cli",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "info"
    },
    {
        key: "MODEL_ALIAS_COMPAT_ENABLED",
        label: "Model Alias Compat",
        description: "Enable model alias compatibility layer",
        descriptionI18nKey: "featureFlagModelAliasCompatEnabledDescription",
        category: "cli",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "PRICING_SYNC_ENABLED",
        label: "Pricing Sync",
        description: "Enable automatic pricing data synchronization (requires the PRICING_SYNC_ENABLED environment variable to be set to true)",
        descriptionI18nKey: "featureFlagPricingSyncEnabledDescription",
        category: "cli",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_AUTO_SYNC_CODEX_PROFILES",
        label: "Auto-Sync Codex Profiles",
        description: "After a provider model sync, automatically (re)write ~/.codex/*.config.toml profile files from the live catalog. Never changes the active/default Codex config. Off by default.",
        descriptionI18nKey: "featureFlagOmnirouteAutoSyncCodexProfilesDescription",
        category: "cli",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_AUTO_SYNC_CLAUDE_PROFILES",
        label: "Auto-Sync Claude Code Profiles",
        description: "After a provider model sync, automatically (re)write ~/.claude/profiles/<name>/settings.json Claude Code profiles from the live catalog. Never changes the active/default Claude config. Off by default.",
        descriptionI18nKey: "featureFlagOmnirouteAutoSyncClaudeProfilesDescription",
        category: "cli",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    // ──────────────── Health (3) ────────────────
    {
        key: "OMNIROUTE_DISABLE_LOCAL_HEALTHCHECK",
        label: "Disable Local Health Check",
        description: "Disable the local instance health check endpoint",
        descriptionI18nKey: "featureFlagOmnirouteDisableLocalHealthcheckDescription",
        category: "health",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_DISABLE_TOKEN_HEALTHCHECK",
        label: "Disable Token Health Check",
        description: "Disable the token validation health check",
        descriptionI18nKey: "featureFlagOmnirouteDisableTokenHealthcheckDescription",
        category: "health",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "SKILLS_SANDBOX_NETWORK_ENABLED",
        label: "Skills Sandbox Network",
        description: "Enable network access in the skills sandbox environment",
        descriptionI18nKey: "featureFlagSkillsSandboxNetworkEnabledDescription",
        category: "health",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    }
];
}),
"[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getModelsCatalogPrefixMode",
    ()=>getModelsCatalogPrefixMode,
    "isApiKeyRevealEnabledFlag",
    ()=>isApiKeyRevealEnabledFlag,
    "isArenaEloSyncEnabled",
    ()=>isArenaEloSyncEnabled,
    "isCcCompatibleProviderEnabled",
    ()=>isCcCompatibleProviderEnabled,
    "isControlPlaneProxyDirectFallbackEnabled",
    ()=>isControlPlaneProxyDirectFallbackEnabled,
    "isFeatureFlagEnabled",
    ()=>isFeatureFlagEnabled,
    "isModelCatalogNamesEnabled",
    ()=>isModelCatalogNamesEnabled,
    "isRequireApiKeyEnabled",
    ()=>isRequireApiKeyEnabled,
    "resolveAllFeatureFlags",
    ()=>resolveAllFeatureFlags,
    "resolveFeatureFlag",
    ()=>resolveFeatureFlag
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/featureFlags.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$featureFlagDefinitions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/featureFlagDefinitions.ts [app-route] (ecmascript)");
;
;
function resolveFeatureFlag(key) {
    const dbOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFeatureFlagOverride"])(key);
    if (dbOverride !== undefined) return dbOverride;
    const envValue = process.env[key];
    if (envValue !== undefined && envValue !== "") return envValue;
    const definition = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$featureFlagDefinitions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FEATURE_FLAG_DEFINITIONS"].find((d)=>d.key === key);
    return definition?.defaultValue ?? "false";
}
function isFeatureFlagEnabled(key) {
    const value = resolveFeatureFlag(key);
    return value === "true" || value === "1" || value === "yes";
}
function resolveAllFeatureFlags() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$featureFlagDefinitions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FEATURE_FLAG_DEFINITIONS"].map((definition)=>{
        const dbOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFeatureFlagOverride"])(definition.key);
        if (dbOverride !== undefined) {
            return {
                key: definition.key,
                effectiveValue: dbOverride,
                source: "db",
                definition
            };
        }
        const envValue = process.env[definition.key];
        if (envValue !== undefined && envValue !== "") {
            return {
                key: definition.key,
                effectiveValue: envValue,
                source: "env",
                definition
            };
        }
        return {
            key: definition.key,
            effectiveValue: definition.defaultValue,
            source: "default",
            definition
        };
    });
}
function isRequireApiKeyEnabled() {
    try {
        return isFeatureFlagEnabled("REQUIRE_API_KEY");
    } catch (error) {
        console.error("[featureFlags] Failed to resolve REQUIRE_API_KEY, defaulting to required:", error instanceof Error ? error.message : error);
        return true;
    }
}
function isCcCompatibleProviderEnabled() {
    return isFeatureFlagEnabled("ENABLE_CC_COMPATIBLE_PROVIDER");
}
function isApiKeyRevealEnabledFlag() {
    try {
        return isFeatureFlagEnabled("ALLOW_API_KEY_REVEAL");
    } catch (error) {
        console.error("[featureFlags] Failed to resolve ALLOW_API_KEY_REVEAL, defaulting to disabled:", error instanceof Error ? error.message : error);
        return false;
    }
}
function isModelCatalogNamesEnabled() {
    return isFeatureFlagEnabled("MODEL_CATALOG_INCLUDE_NAMES");
}
function getModelsCatalogPrefixMode() {
    const value = resolveFeatureFlag("MODELS_CATALOG_PREFIX_MODE");
    if (value === "alias" || value === "canonical") return value;
    return "dual";
}
function isArenaEloSyncEnabled() {
    return isFeatureFlagEnabled("ARENA_ELO_SYNC_ENABLED");
}
function isControlPlaneProxyDirectFallbackEnabled() {
    try {
        return isFeatureFlagEnabled("OMNIROUTE_CONTROL_PLANE_PROXY_DIRECT_FALLBACK");
    } catch (error) {
        console.error("[featureFlags] Failed to resolve OMNIROUTE_CONTROL_PLANE_PROXY_DIRECT_FALLBACK, defaulting to disabled:", error instanceof Error ? error.message : error);
        return false;
    }
}
}),
"[project]/src/shared/constants/claudeCodeClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Wire-version data captured from the signed Claude Code binary.
 *
 * Keep this leaf dependency-free so server executors, compatibility bridges,
 * and client-facing identity presets can share one source of truth.
 */ __turbopack_context__.s([
    "CLAUDE_CODE_CLIENT_BILLING_VERSION",
    ()=>CLAUDE_CODE_CLIENT_BILLING_VERSION,
    "CLAUDE_CODE_CLIENT_BUILD_REVISION",
    ()=>CLAUDE_CODE_CLIENT_BUILD_REVISION,
    "CLAUDE_CODE_CLIENT_VERSION",
    ()=>CLAUDE_CODE_CLIENT_VERSION,
    "CLAUDE_CODE_RUNTIME_VERSION",
    ()=>CLAUDE_CODE_RUNTIME_VERSION,
    "CLAUDE_CODE_SDK_PACKAGE_VERSION",
    ()=>CLAUDE_CODE_SDK_PACKAGE_VERSION,
    "getClaudeCodeUserAgent",
    ()=>getClaudeCodeUserAgent
]);
const CLAUDE_CODE_CLIENT_VERSION = "2.1.220";
const CLAUDE_CODE_CLIENT_BUILD_REVISION = "1f2";
const CLAUDE_CODE_CLIENT_BILLING_VERSION = `${CLAUDE_CODE_CLIENT_VERSION}.${CLAUDE_CODE_CLIENT_BUILD_REVISION}`;
const CLAUDE_CODE_SDK_PACKAGE_VERSION = "0.94.0";
const CLAUDE_CODE_RUNTIME_VERSION = "v26.3.0";
function getClaudeCodeUserAgent(entrypoint) {
    return `claude-cli/${CLAUDE_CODE_CLIENT_VERSION} (external, ${entrypoint})`;
}
}),
"[project]/src/shared/constants/codexClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_CLI_RS_ORIGINATOR",
    ()=>CODEX_CLI_RS_ORIGINATOR,
    "DEFAULT_CODEX_CLIENT_VERSION",
    ()=>DEFAULT_CODEX_CLIENT_VERSION,
    "getCodexCliRsHeaders",
    ()=>getCodexCliRsHeaders
]);
const DEFAULT_CODEX_CLIENT_VERSION = "0.146.0";
const CODEX_CLI_RS_ORIGINATOR = "codex_cli_rs";
function getCodexCliRsHeaders(version = DEFAULT_CODEX_CLIENT_VERSION) {
    return {
        "User-Agent": `${CODEX_CLI_RS_ORIGINATOR}/${version}`,
        originator: CODEX_CLI_RS_ORIGINATOR
    };
}
}),
"[project]/src/shared/constants/bodySize.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_REQUEST_BODY_LIMIT_BYTES",
    ()=>DEFAULT_REQUEST_BODY_LIMIT_BYTES,
    "DEFAULT_REQUEST_BODY_LIMIT_MB",
    ()=>DEFAULT_REQUEST_BODY_LIMIT_MB,
    "MAX_REQUEST_BODY_LIMIT_MB",
    ()=>MAX_REQUEST_BODY_LIMIT_MB,
    "MIN_REQUEST_BODY_LIMIT_MB",
    ()=>MIN_REQUEST_BODY_LIMIT_MB,
    "REQUEST_BODY_BYTES_PER_MB",
    ()=>REQUEST_BODY_BYTES_PER_MB,
    "normalizeRequestBodyLimitMb",
    ()=>normalizeRequestBodyLimitMb,
    "parseRequestBodyLimitBytes",
    ()=>parseRequestBodyLimitBytes,
    "requestBodyLimitBytesToMb",
    ()=>requestBodyLimitBytesToMb,
    "requestBodyLimitMbFromEnv",
    ()=>requestBodyLimitMbFromEnv,
    "requestBodyLimitMbToBytes",
    ()=>requestBodyLimitMbToBytes
]);
const REQUEST_BODY_BYTES_PER_MB = 1024 * 1024;
const DEFAULT_REQUEST_BODY_LIMIT_MB = 10;
const MIN_REQUEST_BODY_LIMIT_MB = 1;
const MAX_REQUEST_BODY_LIMIT_MB = 500;
const DEFAULT_REQUEST_BODY_LIMIT_BYTES = DEFAULT_REQUEST_BODY_LIMIT_MB * REQUEST_BODY_BYTES_PER_MB;
function normalizeRequestBodyLimitMb(value) {
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    if (!Number.isFinite(parsed)) return null;
    const normalized = Math.floor(parsed);
    if (normalized < MIN_REQUEST_BODY_LIMIT_MB || normalized > MAX_REQUEST_BODY_LIMIT_MB) {
        return null;
    }
    return normalized;
}
function requestBodyLimitMbToBytes(value) {
    return value * REQUEST_BODY_BYTES_PER_MB;
}
function parseRequestBodyLimitBytes(value) {
    if (!value) return DEFAULT_REQUEST_BODY_LIMIT_BYTES;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_REQUEST_BODY_LIMIT_BYTES;
}
function requestBodyLimitBytesToMb(value) {
    const configuredMb = Math.round(value / REQUEST_BODY_BYTES_PER_MB);
    return Math.min(MAX_REQUEST_BODY_LIMIT_MB, Math.max(MIN_REQUEST_BODY_LIMIT_MB, configuredMb));
}
function requestBodyLimitMbFromEnv(value) {
    return requestBodyLimitBytesToMb(parseRequestBodyLimitBytes(value));
}
}),
"[project]/src/shared/constants/responsesPreviousResponseId.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_RESPONSES_PREVIOUS_RESPONSE_ID_MODE",
    ()=>DEFAULT_RESPONSES_PREVIOUS_RESPONSE_ID_MODE,
    "RESPONSES_PREVIOUS_RESPONSE_ID_MODES",
    ()=>RESPONSES_PREVIOUS_RESPONSE_ID_MODES
]);
const RESPONSES_PREVIOUS_RESPONSE_ID_MODES = [
    "auto",
    "strip",
    "preserve"
];
const DEFAULT_RESPONSES_PREVIOUS_RESPONSE_ID_MODE = "auto";
}),
"[project]/src/shared/constants/providers/noauth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider catalog data — extracted from providers.ts (god-file decomposition).
 * Pure data literal; re-exported by the providers.ts barrel. No behavior change.
 */ __turbopack_context__.s([
    "NOAUTH_PROVIDERS",
    ()=>NOAUTH_PROVIDERS,
    "NOAUTH_PROVIDER_PROXY_SUPPORTED",
    ()=>NOAUTH_PROVIDER_PROXY_SUPPORTED,
    "supportsNoAuthProviderProxy",
    ()=>supportsNoAuthProviderProxy
]);
const NOAUTH_PROVIDERS = {
    "devin-cli-agentic": {
        id: "devin-cli-agentic",
        alias: "dva",
        name: "Devin CLI Agentic Bridge",
        icon: "terminal",
        color: "#635BFF",
        textIcon: "DV",
        website: "https://docs.devin.ai/work-with-devin/devin-cli",
        noAuth: true,
        hasFree: false,
        serviceKinds: [
            "llm"
        ],
        isLocalCli: true,
        toolCalling: "emulated",
        authHint: "Authentication is owned by the official Devin CLI in its isolated bridge volume.",
        notice: {
            text: "This provider accepts only the official Devin CLI over local ACP stdio and never falls back to another provider."
        }
    },
    opencode: {
        id: "opencode",
        alias: "oc",
        name: "OpenCode Free",
        icon: "terminal",
        color: "#E87040",
        textIcon: "OC",
        website: "https://opencode.ai",
        noAuth: true,
        hasFree: true,
        serviceKinds: [
            "llm"
        ],
        authHint: "No API key required — uses OpenCode's public free endpoint.",
        freeNote: "No API key required — public OpenCode endpoint with Kimi, GLM, Qwen, MiMo, MiniMax models.",
        notice: {
            text: "OpenCode Free uses the public OpenCode endpoint (https://opencode.ai/zen/v1). No signup or API key needed. Rate limits apply."
        }
    },
    "duckduckgo-web": {
        id: "duckduckgo-web",
        alias: "ddgw",
        name: "DuckDuckGo AI Chat",
        icon: "auto_awesome",
        color: "#DE5833",
        textIcon: "DDG",
        website: "https://duckduckgo.com/duckchat",
        noAuth: true,
        hasFree: true,
        serviceKinds: [
            "llm"
        ],
        freeNote: "Free — anonymous access to multiple AI models via DuckDuckGo.",
        authHint: "No credentials required — DuckDuckGo AI Chat is anonymous and free.",
        // #7286: tools[] is prompt-emulated via webTools.ts (parseToolCallsFromText).
        toolCalling: "emulated"
    },
    "felo-web": {
        id: "felo-web",
        alias: "felo",
        name: "Felo",
        icon: "travel_explore",
        color: "#5B7FFF",
        textIcon: "FL",
        website: "https://felo.ai",
        noAuth: true,
        hasFree: true,
        serviceKinds: [
            "llm"
        ],
        freeNote: "Free — anonymous access to Felo's chat/search-agent aggregator. No API key.",
        authHint: "No credentials required — Felo is a free, no-signup chat/search aggregator.",
        notice: {
            text: "Felo uses a reverse-engineered public endpoint (no official API). No signup or API key needed. Behavior may change without notice if Felo updates its frontend."
        }
    },
    theoldllm: {
        id: "theoldllm",
        alias: "tllm",
        name: "The Old LLM (Free)",
        icon: "auto_awesome",
        color: "#8B5CF6",
        textIcon: "TL",
        website: "https://theoldllm.vercel.app",
        noAuth: true,
        hasFree: true,
        serviceKinds: [
            "llm"
        ],
        freeNote: "Free — GPT-5.4, Claude 4.6 Opus/Sonnet/Haiku, + more. No API key — tokens auto-generated via browser.",
        authHint: "No credentials required. The executor auto-generates access tokens via an embedded Playwright browser instance."
    },
    chipotle: {
        id: "chipotle",
        alias: "pepper",
        name: "Chipotle Pepper AI (Free)",
        icon: "restaurant",
        color: "#C41230",
        textIcon: "🌯",
        website: "https://amelia.chipotle.com",
        noAuth: true,
        hasFree: true,
        serviceKinds: [
            "llm"
        ],
        freeNote: "Free — Chipotle's Pepper AI (IPsoft Amelia). Anonymous sessions, no API key. Rate-limited.",
        authHint: "No credentials required. Uses Chipotle's public support chatbot via reverse-engineered SockJS/STOMP protocol."
    },
    "veoaifree-web": {
        id: "veoaifree-web",
        alias: "veo-free",
        name: "Veo AI Free",
        icon: "videocam",
        color: "#8B5CF6",
        textIcon: "VF",
        website: "https://veoaifree.com",
        noAuth: true,
        hasFree: true,
        serviceKinds: [
            "video"
        ],
        freeNote: "Free video generation — VEO 3.1, Seedance. 6 requests/hour.",
        authHint: "No auth required. Rate limited to 6 requests/hour per IP."
    },
    mimocode: {
        id: "mimocode",
        alias: "mcode",
        name: "MiMoCode (Free)",
        icon: "devices",
        color: "#FF6B35",
        textIcon: "MC",
        website: "https://mimo.mi.com",
        noAuth: true,
        hasFree: true,
        serviceKinds: [
            "llm"
        ],
        freeNote: "Free — Xiaomi MiMo models via bootstrap JWT auth. No API key required. Supports streaming.",
        authHint: "No API key required. The executor auto-generates JWT tokens via device fingerprint bootstrap.",
        notice: {
            text: "MiMoCode uses Xiaomi's public free AI endpoint with bootstrap-based JWT authentication. No signup needed. Rate limits apply."
        }
    },
    auggie: {
        id: "auggie",
        alias: "aug",
        name: "Augment (Auggie CLI)",
        icon: "terminal",
        color: "#7C3AED",
        textIcon: "AU",
        website: "https://augmentcode.com",
        noAuth: true,
        hasFree: false,
        serviceKinds: [
            "llm"
        ],
        isLocalCli: true,
        freeNote: "Local passthrough — runs the Augment CLI (`auggie`) on this machine. Auth is handled by `auggie login`, not OmniRoute.",
        authHint: "No API key stored by OmniRoute. Install the Auggie CLI and run `auggie login` on this machine, then OmniRoute spawns it locally for each request.",
        notice: {
            text: "Augment (Auggie CLI) requires the `auggie` binary installed and authenticated locally (`auggie login`). OmniRoute spawns it as a subprocess and never sees or stores your Augment credentials."
        }
    },
    aihorde: {
        id: "aihorde",
        alias: "horde",
        name: "AI Horde",
        icon: "diversity_3",
        color: "#8B5CF6",
        textIcon: "AH",
        website: "https://aihorde.net",
        noAuth: true,
        hasFree: true,
        passthroughModels: true,
        serviceKinds: [
            "llm"
        ],
        authHint: "No API key required — uses AI Horde's documented anonymous key. Adding a free aihorde.net key is optional and only buys higher queue priority (kudos).",
        freeNote: "Crowdsourced inference from volunteer GPUs. Throughput is a shared queue, not a quota: there is no RPM/RPD cap, but waits grow when the network is busy.",
        notice: {
            text: "AI Horde routes to volunteer-run workers, so responses can take minutes and tool calling is unavailable. Model availability changes as workers come and go."
        }
    }
};
const NOAUTH_PROVIDER_PROXY_SUPPORTED = new Set([
    "opencode",
    "theoldllm"
]);
function supportsNoAuthProviderProxy(providerId) {
    return NOAUTH_PROVIDER_PROXY_SUPPORTED.has(providerId);
}
}),
"[project]/src/shared/constants/gitlabDuoSetupMessage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * #3861 / #8688 — GitLab Duo needs an operator-registered OAuth application.
 * Same copy is used for:
 * - catalog `authHint` (pre-connect guidance)
 * - OAuthModal setup step (before auto-start)
 * - authorize-route error when `GITLAB_DUO_OAUTH_CLIENT_ID` is unset
 */ __turbopack_context__.s([
    "GITLAB_DUO_OAUTH_APPLICATIONS_URL",
    ()=>GITLAB_DUO_OAUTH_APPLICATIONS_URL,
    "GITLAB_DUO_OAUTH_DEFAULT_REDIRECT_URI",
    ()=>GITLAB_DUO_OAUTH_DEFAULT_REDIRECT_URI,
    "GITLAB_DUO_OAUTH_SCOPES",
    ()=>GITLAB_DUO_OAUTH_SCOPES,
    "GITLAB_DUO_OAUTH_SETUP_MESSAGE",
    ()=>GITLAB_DUO_OAUTH_SETUP_MESSAGE
]);
const GITLAB_DUO_OAUTH_APPLICATIONS_URL = "https://gitlab.com/-/profile/applications";
const GITLAB_DUO_OAUTH_DEFAULT_REDIRECT_URI = "http://localhost:20128/callback";
const GITLAB_DUO_OAUTH_SCOPES = "ai_features read_user";
const GITLAB_DUO_OAUTH_SETUP_MESSAGE = "GitLab Duo OAuth is not configured. Register an OAuth application at " + `${GITLAB_DUO_OAUTH_APPLICATIONS_URL} with redirect URI ` + `${GITLAB_DUO_OAUTH_DEFAULT_REDIRECT_URI} and scopes "${GITLAB_DUO_OAUTH_SCOPES}", then set ` + "GITLAB_DUO_OAUTH_CLIENT_ID (and optionally GITLAB_DUO_OAUTH_CLIENT_SECRET) and restart.";
}),
"[project]/src/shared/constants/providers/oauth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OAUTH_PROVIDERS",
    ()=>OAUTH_PROVIDERS
]);
/**
 * Provider catalog data — extracted from providers.ts (god-file decomposition).
 * Pure data literal; re-exported by the providers.ts barrel. No behavior change.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$gitlabDuoSetupMessage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/gitlabDuoSetupMessage.ts [app-route] (ecmascript)");
;
const OAUTH_PROVIDERS = {
    "ghe-copilot": {
        id: "ghe-copilot",
        alias: "ghe-copilot",
        name: "GitHub Enterprise Copilot",
        icon: "code",
        color: "#10B981",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        authHint: "Enter your GHE instance URL (e.g., https://ghe.company.com) in provider settings, then authenticate via device flow."
    },
    "xai-oauth": {
        id: "xai-oauth",
        alias: "xao",
        name: "xAI OAuth (Grok)",
        icon: "auto_awesome",
        color: "#1DA1F2",
        textIcon: "XA",
        website: "https://x.ai",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        authHint: "Sign in with xAI to use api.x.ai models such as Grok 4.5. This is separate from Grok Build JWT sessions, which use cli-chat-proxy.grok.com and grok-build model aliases."
    },
    "grok-cli": {
        id: "grok-cli",
        alias: "gc",
        name: "Grok Build",
        icon: "bolt",
        color: "#000000",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        authHint: "Sign in with your browser, or paste your ~/.grok/auth.json (or the JWT access token) from the Grok Build CLI; refresh_token is rotated automatically either way."
    },
    qoder: {
        id: "qoder",
        alias: "if",
        name: "Qoder",
        icon: "water_drop",
        color: "#6366F1",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        hasFree: true
    },
    agy: {
        id: "agy",
        alias: "agy",
        name: "Antigravity CLI",
        icon: "terminal",
        color: "#F59E0B",
        textIcon: "AGY",
        website: "https://antigravity.google",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        hasFree: true,
        authHint: "Import your Antigravity CLI (`agy`) login (paste/upload its token file), auto-detect a local CLI login, or sign in with Google. Shares the Antigravity backend (incl. Claude models)."
    },
    kiro: {
        id: "kiro",
        alias: "kr",
        name: "Kiro AI",
        icon: "psychology_alt",
        color: "#FF6B35",
        subscriptionRisk: true,
        riskNoticeVariant: "deprecated",
        hasFree: true,
        freeNote: "Free tier: 50 credits/month (~25K–100K tokens). ⚠️ Kiro ToS prohibits third-party proxy/harness use."
    },
    "amazon-q": {
        id: "amazon-q",
        alias: "aq",
        name: "Amazon Q",
        icon: "cloud",
        color: "#FF9900",
        textIcon: "AQ",
        website: "https://aws.amazon.com/q/developer/",
        hasFree: true,
        authHint: "Uses the same AWS Builder ID or imported refresh-token flow as Kiro, but keeps Amazon Q connections separate."
    },
    claude: {
        id: "claude",
        alias: "cc",
        name: "Claude Code",
        icon: "smart_toy",
        color: "#D97757",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth"
    },
    antigravity: {
        id: "antigravity",
        alias: undefined,
        name: "Antigravity",
        icon: "rocket_launch",
        color: "#F59E0B",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth"
    },
    codex: {
        id: "codex",
        alias: "cx",
        name: "OpenAI Codex",
        icon: "code",
        color: "#3B82F6",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth"
    },
    github: {
        id: "github",
        alias: "gh",
        name: "GitHub Copilot",
        icon: "code",
        color: "#333333"
    },
    "gitlab-duo": {
        id: "gitlab-duo",
        alias: "gitlab-duo",
        name: "GitLab Duo",
        icon: "hub",
        color: "#FC6D26",
        textIcon: "GL",
        website: "https://docs.gitlab.com/user/duo_agent_platform/code_suggestions/",
        // #8688: full actionable recipe (same string as authorize error + OAuthModal setup step)
        authHint: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$gitlabDuoSetupMessage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITLAB_DUO_OAUTH_SETUP_MESSAGE"]
    },
    cursor: {
        id: "cursor",
        alias: "cu",
        name: "Cursor IDE",
        icon: "edit_note",
        color: "#00D4AA",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth"
    },
    zed: {
        id: "zed",
        alias: "zd",
        name: "Zed IDE",
        icon: "code",
        color: "#084CCF",
        textIcon: "ZD",
        website: "https://zed.dev",
        authHint: "Zed stores LLM provider credentials (OpenAI, Anthropic, Google, Mistral, xAI) in the OS keychain. Use the Import button below to discover and import them automatically."
    },
    "zed-hosted": {
        id: "zed-hosted",
        alias: undefined,
        name: "Zed Hosted Models",
        icon: "code_blocks",
        color: "#101010",
        textIcon: "ZH",
        website: "https://zed.dev",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        authHint: "Sign in with your Zed account (native-app sign-in). OmniRoute generates a one-time RSA keypair and opens zed.dev to authorize it — on a remote/headless install, copy the resulting 127.0.0.1 callback URL from your browser's address bar and paste it back here. Distinct from the 'Zed IDE' credential-import entry above: this proxies chat completions through Zed's own hosted model aggregator (cloud.zed.dev), fronting Anthropic/OpenAI/Google/xAI models under your Zed plan."
    },
    trae: {
        id: "trae",
        alias: "tr",
        name: "Trae",
        icon: "edit_square",
        color: "#FF7849",
        textIcon: "TR",
        website: "https://trae.ai",
        authHint: "Trae is an AI-native IDE by ByteDance (SOLO remote agent). Authorize via trae.ai in the popup, or sign in at solo.trae.ai and paste the Cloud-IDE-JWT (sent as 'Authorization: Cloud-IDE-JWT <token>', ~14-day lifetime) as the access token; web_id/biz_user_id/user_unique_id/scope/tenant/region propagate via providerSpecificData. No headless refresh for pasted tokens — re-paste on expiry."
    },
    raycast: {
        id: "raycast",
        alias: "rc",
        name: "Raycast Pro AI",
        icon: "terminal",
        color: "#FF6363",
        textIcon: "RC",
        website: "https://raycast.com/ai",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        authHint: "Unofficial integration — uses your Raycast Pro subscription via credentials from the macOS app (Auto-Import or manual capture). May break on Raycast updates. Not for redistribution; personal use only."
    },
    "kimi-coding": {
        id: "kimi-coding",
        alias: "kmc",
        name: "Kimi Code CLI",
        icon: "psychology",
        color: "#1E40AF",
        textIcon: "KC",
        // Kimi official-partnership aff link (2026-07) — the "Kimi Coding Plan"
        // tracking link. Was previously unset (no header link rendered at all).
        website: "https://www.kimi.com/code?aff=omniroute",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        authHint: "Sign in with the same Kimi account used by Kimi Code CLI. OmniRoute uses the CLI OAuth flow and Kimi Coding Plan endpoints."
    },
    kilocode: {
        id: "kilocode",
        alias: "kc",
        name: "Kilo Code",
        icon: "code",
        color: "#FF6B35",
        textIcon: "KC",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        // #4019: serve Kilo's free models without signup. With no account connected,
        // getProviderCredentials synthesizes a noauth credential and the executor
        // sends `Bearer anonymous` (see the kilocode registry `anonymousApiKey`).
        anonymousFallback: true
    },
    cline: {
        id: "cline",
        alias: "cl",
        name: "Cline",
        icon: "smart_toy",
        color: "#5B9BD5",
        textIcon: "CL",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth"
    },
    clinepass: {
        id: "clinepass",
        alias: "cp",
        name: "ClinePass",
        icon: "smart_toy",
        color: "#9D4EDD",
        textIcon: "CP",
        website: "https://cline.bot/cline-pass",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        authHint: "ClinePass is Cline's $9.99/mo subscription bundling 10 open coding models. Sign in with your Cline account (same login as the Cline CLI/IDE), or paste a direct ClinePass API key (app.cline.bot → Settings → API Keys). A ClinePass subscription unlocks the cline-pass/* models. Reuses the Cline WorkOS OAuth flow."
    },
    windsurf: {
        id: "windsurf",
        alias: "ws",
        name: "Windsurf (Devin CLI)",
        icon: "air",
        color: "#00C5A0",
        textIcon: "WS",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        authHint: 'In the Windsurf / VS Code IDE, open the command palette and run `Windsurf: Provide Auth Token` (or click the Jupyter "Get Windsurf Authentication Token" button), then copy the shown token and paste it here. Note: opening windsurf.com/show-auth-token directly only renders a "Redirecting" page — the IDE must initiate the flow (it adds a `?state=...` param) for the token to appear.',
        website: "https://windsurf.com"
    },
    "devin-cli": {
        id: "devin-cli",
        alias: "dv",
        name: "Devin CLI (Official)",
        icon: "terminal",
        color: "#6366F1",
        textIcon: "DV",
        authHint: "Requires the Devin CLI binary. Run `devin auth login` to authenticate, or provide your WINDSURF_API_KEY. Install: https://cli.devin.ai",
        website: "https://cli.devin.ai"
    },
    "codebuddy-cn": {
        id: "codebuddy-cn",
        alias: "cbcn",
        name: "CodeBuddy CN",
        icon: "smart_toy",
        color: "#006EFF",
        textIcon: "CB",
        website: "https://copilot.tencent.com",
        subscriptionRisk: true,
        riskNoticeVariant: "oauth",
        authHint: "Tencent CodeBuddy CN (copilot.tencent.com). Sign in via the official CLI device-code flow, or paste a direct API key (sent as Authorization: Bearer). Catalog: GLM / Kimi / MiniMax / DeepSeek / Hunyuan."
    }
};
}),
"[project]/src/shared/constants/providers/web-cookie.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider catalog data — extracted from providers.ts (god-file decomposition).
 * Pure data literal; re-exported by the providers.ts barrel. No behavior change.
 */ __turbopack_context__.s([
    "WEB_COOKIE_PROVIDERS",
    ()=>WEB_COOKIE_PROVIDERS,
    "resolveWebProviderHost",
    ()=>resolveWebProviderHost
]);
const WEB_COOKIE_PROVIDERS = {
    "chatgpt-web": {
        id: "chatgpt-web",
        alias: "cgpt-web",
        name: "ChatGPT Web (Plus/Pro)",
        icon: "auto_awesome",
        color: "#10A37F",
        textIcon: "CG",
        website: "https://chatgpt.com",
        authHint: "Paste your __Secure-next-auth.session-token cookie value from chatgpt.com",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        toolCalling: "emulated"
    },
    "grok-web": {
        id: "grok-web",
        alias: "gw",
        name: "Grok Web (Subscription)",
        icon: "auto_awesome",
        color: "#1DA1F2",
        textIcon: "GW",
        website: "https://grok.com",
        authHint: "Paste the full grok.com cookie line from DevTools → Application → Cookies. Include both `sso` and `sso-rw` (e.g. `sso=...; sso-rw=...`) — Grok's anti-bot rejects `sso` on its own.",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie"
    },
    "gemini-web": {
        id: "gemini-web",
        alias: "gweb",
        name: "Gemini Web (Free)",
        icon: "auto_awesome",
        color: "#4285F4",
        textIcon: "GWeb",
        website: "https://gemini.google.com",
        authHint: "Paste your __Secure-1PSID cookie value from gemini.google.com. Optionally add __Secure-1PSIDTS separated by semicolon.",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        // #7286 Level 2: tools[] is prompt-emulated via webTools.ts (parseToolCallsFromText).
        toolCalling: "emulated"
    },
    "perplexity-web": {
        id: "perplexity-web",
        alias: "pplx-web",
        name: "Perplexity Web (Pro/Max)",
        icon: "search",
        color: "#20808D",
        textIcon: "PW",
        website: "https://www.perplexity.ai",
        authHint: "Paste your __Secure-next-auth.session-token cookie value from perplexity.ai",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        toolCalling: "emulated"
    },
    "blackbox-web": {
        id: "blackbox-web",
        alias: "bb-web",
        name: "Blackbox Web (Subscription)",
        icon: "view_in_ar",
        color: "#1A1A2E",
        textIcon: "BW",
        website: "https://app.blackbox.ai",
        authHint: "Paste your __Secure-authjs.session-token value or full cookie header from app.blackbox.ai",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        toolCalling: "emulated"
    },
    "muse-spark-web": {
        id: "muse-spark-web",
        alias: "ms-web",
        name: "Muse Spark Web (Meta AI)",
        icon: "auto_awesome",
        color: "#0866FF",
        textIcon: "MS",
        website: "https://www.meta.ai",
        hasFree: true,
        freeNote: "Free with login — Meta AI platform with Llama models.",
        authHint: "Paste your ecto_1_sess cookie AND the ecto1:... WS auth token from meta.ai. " + "Capture the ecto1: token in DevTools → Network → WS → the clippy request's Authorization query param. " + "Example: ecto_1_sess=4240a308...NVDg0; ecto1:ABCD...",
        toolCalling: "emulated"
    },
    "claude-web": {
        id: "claude-web",
        alias: "cw",
        name: "Claude Web",
        icon: "auto_awesome",
        color: "#D97757",
        textIcon: "CW",
        website: "https://claude.ai",
        authHint: "Paste your session cookie from claude.ai",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        // #7286 Level 3 (deferred): still silently drops tools[] — getDefaultTools()
        // is a fixed Claude.ai backend contract; needs an emulate-vs-native decision.
        toolCalling: "none"
    },
    "deepseek-web": {
        id: "deepseek-web",
        alias: "ds-web",
        name: "DeepSeek Web",
        icon: "auto_awesome",
        color: "#4D6BFE",
        textIcon: "DS",
        website: "https://chat.deepseek.com",
        authHint: "Paste your userToken from chat.deepseek.com — DevTools → Application → Local Storage → userToken",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        toolCalling: "emulated"
    },
    "copilot-web": {
        id: "copilot-web",
        alias: "copilot",
        name: "Microsoft Copilot Web",
        icon: "auto_awesome",
        color: "#0078D4",
        textIcon: "CP",
        website: "https://copilot.microsoft.com",
        authHint: "Paste your access_token from copilot.microsoft.com (or export a .har file from DevTools while logged in)",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie"
    },
    "copilot-m365-web": {
        id: "copilot-m365-web",
        alias: "m365copilot",
        name: "Microsoft 365 Copilot (BizChat)",
        icon: "business_center",
        color: "#0078D4",
        textIcon: "M365",
        website: "https://m365.cloud.microsoft/chat",
        authHint: "Sign in at m365.cloud.microsoft/chat, then open DevTools → Network → filter 'WS' → click the Chathub WebSocket connection. Copy both the access_token query parameter AND the account-specific Chathub path segment from its request URL (wss://…/Chathub/<path>?…&access_token=…). It is NOT an Authorization: Bearer header on an XHR/Fetch request. The token is short-lived; this is an unofficial integration.",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie"
    },
    "microsoft-designer-web": {
        id: "microsoft-designer-web",
        alias: "msdesigner",
        name: "Microsoft Designer (Image Generation)",
        icon: "auto_awesome",
        color: "#0078D4",
        textIcon: "MSD",
        website: "https://designer.microsoft.com",
        authHint: "Sign in at designer.microsoft.com, then open DevTools → Network, generate an image, and find the request to DallE.ashx?action=GetDallEImagesCogSci. Copy the value of its Authorization: Bearer header (the access_token — no 'Bearer ' prefix). The token is short-lived; this is an unofficial, reverse-engineered integration.",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie"
    },
    "t3-web": {
        id: "t3-web",
        alias: "t3chat",
        name: "t3.chat (Pro/Free)",
        icon: "auto_awesome",
        color: "#7C3AED",
        textIcon: "T3",
        website: "https://t3.chat",
        hasFree: true,
        freeNote: "Free tier gives limited model access. Pro ($8/month) unlocks 50+ models.",
        authHint: "Open t3.chat in your browser, log in, then open DevTools → Application → Local Storage → https://t3.chat. " + "Copy the value of 'convex-session-id'. Also open DevTools → Network, copy the Cookie header from any request. " + "Paste both values here. See provider setup docs for a step-by-step guide.",
        toolCalling: "emulated"
    },
    "inner-ai": {
        id: "inner-ai",
        alias: "in-ai",
        name: "Inner.ai (Subscription)",
        icon: "auto_awesome",
        color: "#1A56DB",
        textIcon: "IA",
        website: "https://app.innerai.com",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        authHint: "Paste your token cookie and email separated by a space: open DevTools → Application → Cookies → .innerai.com, copy the token value, then append a space and your Inner.ai login email. Example: eyJhbG... user@example.com",
        toolCalling: "emulated"
    },
    "adapta-web": {
        id: "adapta-web",
        alias: "adp-web",
        name: "Adapta.org (Adapta One Web)",
        icon: "auto_awesome",
        color: "#6E3AD3",
        textIcon: "AW",
        website: "https://agent.adapta.one",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        authHint: "Paste your __client cookie value from .clerk.agent.adapta.one (DevTools → Application → Cookies)",
        toolCalling: "emulated"
    },
    lmarena: {
        // Wire id stays `lmarena` for DB/combo/model-prefix back-compat.
        // Product rebranded LMArena → Arena (arena.ai) in Jan 2026.
        id: "lmarena",
        alias: "lma",
        name: "Arena (Free)",
        icon: "auto_awesome",
        color: "#FF6B6B",
        textIcon: "AR",
        website: "https://arena.ai",
        hasFree: true,
        freeNote: "Free model comparison platform (formerly LMArena) at arena.ai — Direct-chat catalog of chat models (GPT, Claude, Gemini, Llama, …). No subscription required.",
        authHint: "Paste the full Cookie header from arena.ai (DevTools → Network → request → Cookie). Include arena-auth-prod-v1.0/.1… and cf_clearance/__cf_bm when present. OmniRoute uses Chrome TLS impersonation; if Arena still 403s, set providerSpecificData.recaptchaV3Token from a live browser session.",
        riskNoticeVariant: "webCookie"
    },
    "yuanbao-web": {
        id: "yuanbao-web",
        alias: "ybw",
        name: "Tencent Yuanbao (Free)",
        icon: "auto_awesome",
        color: "#0052D9",
        textIcon: "YB",
        website: "https://yuanbao.tencent.com",
        hasFree: true,
        freeNote: "Free consumer web session — DeepSeek V3/R1 and Hunyuan / Hunyuan-T1, optional web search. No subscription required. Rate limits apply.",
        authHint: "Log in to yuanbao.tencent.com, then paste the full Cookie header (DevTools → Network → any /api request → Request Headers → Cookie). It must contain hy_user and hy_token.",
        riskNoticeVariant: "webCookie"
    },
    huggingchat: {
        id: "huggingchat",
        // "hc" belongs to the hackclub provider; huggingchat uses its own id as alias.
        alias: "huggingchat",
        name: "HuggingChat (Free)",
        icon: "auto_awesome",
        color: "#FFD21E",
        textIcon: "HC",
        website: "https://huggingface.co/chat",
        hasFree: true,
        freeNote: "Free LLM chat — no subscription required. Rate limits apply.",
        authHint: "Paste the full Cookie header from huggingface.co/chat (DevTools → Network → /chat/conversation → Request Headers → Cookie). It should include hf-chat and may also include token / aws-waf-token.",
        riskNoticeVariant: "webCookie"
    },
    "poe-web": {
        id: "poe-web",
        alias: "poe",
        name: "Poe Web (Subscription)",
        icon: "auto_awesome",
        color: "#6C3AED",
        textIcon: "PW",
        website: "https://poe.com",
        authHint: "Paste your p-b cookie value from poe.com (DevTools → Application → Cookies → p-b)",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie"
    },
    "venice-web": {
        id: "venice-web",
        alias: "ven",
        name: "Venice Web (Privacy)",
        icon: "auto_awesome",
        color: "#22C55E",
        textIcon: "VW",
        website: "https://venice.ai",
        authHint: "Paste your session cookie from venice.ai (DevTools → Application → Cookies)",
        riskNoticeVariant: "webCookie"
    },
    "v0-vercel-web": {
        id: "v0-vercel-web",
        // #6343: was "v0", colliding with the unrelated "v0-vercel" API-key provider's
        // alias. Aliases resolve 1:1 to a provider id, so the dashboard's model-string
        // routing always picked v0-vercel, silently hiding this provider's own
        // credentials. Follows the established secondary-web-variant convention (see
        // kimi-web / qwen-web / huggingchat in tests/unit/provider-alias-uniqueness.test.ts):
        // the web/secondary variant uses its own id as alias instead of a short prefix.
        alias: "v0-vercel-web",
        name: "v0 Vercel Web (Code Gen)",
        icon: "auto_awesome",
        color: "#000000",
        textIcon: "V0",
        website: "https://v0.dev",
        authHint: "Paste your session cookie from v0.dev (DevTools → Application → Cookies)",
        riskNoticeVariant: "webCookie"
    },
    "kimi-web": {
        id: "kimi-web",
        // Legacy "kimi" API provider keeps the short alias; web variant uses its own id.
        alias: "kimi-web",
        name: "Kimi Web",
        icon: "auto_awesome",
        color: "#2563EB",
        textIcon: "KW",
        // Kimi official-partnership aff link (2026-07) — the "Kimi Coding Plan"
        // tracking link (same origin as the plain www.kimi.com login flow below,
        // so the "Open {host}" credential guide in WebSessionCredentialGuide.tsx /
        // AddApiKeyModal.tsx is unaffected: origin, not path, decides localStorage
        // access). Was `https://www.kimi.com` (no aff attribution).
        website: "https://www.kimi.com/code?aff=omniroute",
        authHint: "Paste access_token from www.kimi.com DevTools → Application → Local Storage. A legacy kimi-auth cookie is also accepted.",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie"
    },
    "doubao-web": {
        id: "doubao-web",
        alias: "db",
        name: "Dola Web (ByteDance)",
        icon: "auto_awesome",
        color: "#3B82F6",
        textIcon: "DA",
        website: "https://www.dola.com",
        authHint: "Paste the full Cookie header from www.dola.com. It should include sessionid, ttwid, and s_v_web_id. If s_v_web_id is unavailable, fp=verify_... from a chat/completion request URL can be used as a fallback.",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie"
    },
    "hailuo-web": {
        id: "hailuo-web",
        // Distinct alias: avoid colliding with the existing API-key "minimax"/
        // "minimax-cn" providers (src/shared/constants/providers/apikey/regional.ts).
        alias: "hailuo-web",
        name: "Hailuo Web (MiniMax)",
        icon: "auto_awesome",
        color: "#5B21B6",
        textIcon: "HL",
        website: "https://hailuo.ai",
        authHint: "Open hailuo.ai, log in, then open DevTools → Application → Local Storage → copy the " + '"_token" value. device_id/uuid fingerprint fields are derived automatically; if ' + "requests fail, re-capture _token (sessions can expire).",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie"
    },
    "qwen-web": {
        id: "qwen-web",
        // The web variant uses its own id; the retired `qw` alias is not reassigned.
        alias: "qwen-web",
        name: "Qwen Web (Free)",
        icon: "auto_awesome",
        color: "#10B981",
        textIcon: "QW",
        website: "https://chat.qwen.ai",
        hasFree: true,
        freeNote: "Free — Qwen models via chat.qwen.ai with login token. No subscription required.",
        authHint: "Open chat.qwen.ai, log in, then open DevTools → Application → Local Storage → " + 'copy the "token" value (or use tongyi_sso_ticket cookie as Bearer token).',
        toolCalling: "emulated"
    },
    "gemini-business": {
        id: "gemini-business",
        alias: "gembiz",
        name: "Gemini Business (Enterprise)",
        icon: "business_center",
        color: "#4285F4",
        textIcon: "GB",
        website: "https://business.gemini.google",
        hasFree: true,
        freeNote: "Free for Google Workspace enterprise accounts — enterprise Gemini models (Pro, Flash, image, video) via direct StreamGenerate HTTP API. No subscription required, just enterprise SSO.",
        authHint: "From your enterprise account: open business.gemini.google/home/cid/{your-cid}, then copy __Secure-1PSID and __Secure-1PSIDTS cookies from DevTools → Application → Cookies. Paste as a cookie header below."
    },
    "zenmux-free": {
        id: "zenmux-free",
        alias: "zmf",
        name: "ZenMux Free (Web)",
        icon: "bolt",
        color: "#667eea",
        textIcon: "ZF",
        website: "https://zenmux.ai",
        hasFree: true,
        freeNote: "Free tier (5 Flows/5h, 38.64 Flows/week) — DeepSeek V3.2, GLM 4.7 Flash Free and more. No subscription required.",
        authHint: "Login at zenmux.ai, then export all cookies using EditThisCookie or Cookie-Editor and paste the full Cookie header string here. Refresh every ~30 days."
    },
    "zai-web": {
        id: "zai-web",
        alias: "zw",
        name: "Z.ai Web (Free)",
        icon: "auto_awesome",
        color: "#2563EB",
        textIcon: "ZW",
        website: "https://chat.z.ai",
        hasFree: true,
        freeNote: "Free consumer web session — GLM chat models via chat.z.ai. Distinct from the API-key zai/glm providers. No subscription required.",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        authHint: "Paste the full Cookie header from chat.z.ai (must include the token=<JWT> cookie)"
    },
    promptql: {
        id: "promptql",
        alias: "pql",
        name: "PromptQL (Unofficial/Experimental)",
        icon: "auto_awesome",
        color: "#5B21B6",
        textIcon: "PQL",
        website: "https://prompt.ql.app",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        authHint: "Paste the Bearer JWT from prompt.ql.app DevTools → Network → graphql → Authorization (token only). Optional projectId + session Cookie for refresh."
    },
    "notion-web": {
        id: "notion-web",
        alias: "nw",
        name: "Notion AI Web (Unofficial/Experimental)",
        icon: "auto_awesome",
        color: "#000000",
        textIcon: "NW",
        website: "https://www.notion.so",
        // #6758: Notion has no public inference API (see closed request #3272) — this
        // reverse-engineers the same undocumented internal endpoint two independent
        // open-source projects already use. Undocumented endpoints can change without
        // notice; label clearly so operators understand the risk before pasting a
        // session cookie of an account they already pay for.
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        authHint: "Paste only the token_v2 cookie VALUE from app.notion.com (DevTools → Application → Cookies → token_v2). " + "Do not paste token_v2= or the full Cookie header. Workspace is auto-detected; space_id / notion_user_id are optional."
    },
    "adobe-firefly": {
        id: "adobe-firefly",
        alias: "firefly",
        name: "Adobe Firefly (Image/Video)",
        icon: "auto_awesome",
        color: "#EB1000",
        textIcon: "FF",
        website: "https://firefly.adobe.com",
        authHint: "RECOMMENDED: firefly.adobe.com signed-in → F12 → Network → click firefly-3p.ff.adobe.io (generate-async or models/discovery) → Request Headers → Authorization → copy the token AFTER 'Bearer ' (starts with eyJ…). Cookie-only from firefly.adobe.com mints a GUEST token → 401/403; only multi-domain IMS cookies (adobelogin.com) or that Bearer JWT work. Unofficial/experimental media + Limits.",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie"
    },
    hyperagent: {
        id: "hyperagent",
        alias: "ha",
        name: "HyperAgent (Unofficial/Experimental)",
        icon: "auto_awesome",
        color: "#6C5CE7",
        textIcon: "HA",
        website: "https://hyperagent.com",
        subscriptionRisk: true,
        riskNoticeVariant: "webCookie",
        authHint: "Paste the full Cookie header from hyperagent.com (DevTools → Network → any request → Request Headers → Cookie). Session cookies power chat + billing usage."
    }
};
function resolveWebProviderHost(providerId, fallbackBaseUrl) {
    if (!providerId) return null;
    const entry = WEB_COOKIE_PROVIDERS[providerId];
    const website = entry?.website?.trim();
    const fallback = fallbackBaseUrl?.trim();
    const source = website || fallback;
    if (!source) return null;
    try {
        const parsed = new URL(source);
        // Keep the website URL verbatim (it may point at a specific path like
        // `/chat`); for a registry baseUrl fallback, keep only the origin.
        return {
            url: website ? source : parsed.origin,
            host: parsed.host
        };
    } catch  {
        return null;
    }
}
}),
"[project]/src/shared/constants/providers/apikey/gateways.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * APIKEY provider catalog — gateways family (aggregators, multi-model routers & API marketplaces).
 * Pure data; merged by apikey/index.ts via spread (god-file decomposition; semantic split).
 */ __turbopack_context__.s([
    "APIKEY_PROVIDERS_GATEWAYS",
    ()=>APIKEY_PROVIDERS_GATEWAYS
]);
const APIKEY_PROVIDERS_GATEWAYS = {
    // Cheaper Inference (https://cheaperinference.com) — OSS-sponsor gateway.
    // Cost-ranked reseller of 42 upstream models (Anthropic/OpenAI/Google/Moonshot/
    // xAI/Z.AI/DeepSeek/MiniMax) behind one OpenAI-compatible surface, with a native
    // /v1/responses endpoint and 3 image models. Keys are `ir_live_…` bearer tokens.
    cheaperinference: {
        id: "cheaperinference",
        alias: "cinf",
        name: "Cheaper Inference",
        icon: "savings",
        color: "#31f889",
        textIcon: "CI",
        website: "https://cheaperinference.com/?utm_source=omniroute",
        apiHint: "Create an API key at https://cheaperinference.com/?utm_source=omniroute (needs the `inference` scope), then paste the ir_live_… token here.",
        passthroughModels: true
    },
    "charm-hyper": {
        id: "charm-hyper",
        alias: "charm-hyper",
        name: "Charm Hyper",
        icon: "router",
        color: "#7C3AED",
        textIcon: "CH",
        passthroughModels: true,
        website: "https://hyper.charm.land",
        hasFree: true,
        freeNote: "100 free monthly Hypercredits on signup",
        apiHint: "Create an API key at https://hyper.charm.land, then paste it here as a Bearer token."
    },
    agentrouter: {
        id: "agentrouter",
        alias: "agentrouter",
        name: "AgentRouter",
        icon: "router",
        color: "#10B981",
        textIcon: "AR",
        passthroughModels: true,
        website: "https://agentrouter.org",
        hasFree: true,
        freeNote: "$200 free credits on signup - multi-model routing gateway",
        apiHint: "Get $200 free credits at https://agentrouter.org/register — no credit card required."
    },
    unorouter: {
        id: "unorouter",
        alias: "unorouter",
        name: "UnoRouter",
        icon: "unorouter",
        color: "#8B5CF6",
        textIcon: "UR",
        passthroughModels: true,
        website: "https://unorouter.ai",
        apiHint: "Create an API key at https://unorouter.ai, then paste it here as a Bearer token."
    },
    "command-code": {
        id: "command-code",
        alias: "cmd",
        name: "Command Code",
        icon: "terminal",
        color: "#111827",
        textIcon: "CC",
        website: "https://commandcode.ai/",
        authHint: "Use a Command Code API key. Requests are sent to Command Code's /alpha/generate endpoint.",
        apiHint: "Create or copy an API key from Command Code, then paste it here as a Bearer token."
    },
    openrouter: {
        id: "openrouter",
        alias: "openrouter",
        name: "OpenRouter",
        icon: "router",
        color: "#F97316",
        textIcon: "OR",
        passthroughModels: true,
        website: "https://openrouter.ai",
        hasFree: true,
        freeNote: "Free models at $0/token with :free suffix - 20 RPM / 200 RPD"
    },
    requesty: {
        id: "requesty",
        alias: "requesty",
        name: "Requesty",
        icon: "router",
        color: "#6366F1",
        textIcon: "RQ",
        passthroughModels: true,
        website: "https://requesty.ai",
        hasFree: true,
        freeNote: "Free tier ~200 requests/day - multi-model routing gateway (300+ models)",
        apiHint: "Create an API key at https://app.requesty.ai, then paste it here as a Bearer token. " + "OpenAI-compatible endpoint at https://router.requesty.ai/v1, with a live /v1/models catalog."
    },
    dgrid: {
        id: "dgrid",
        alias: "dgrid",
        name: "DGrid",
        icon: "router",
        color: "#65A30D",
        textIcon: "DG",
        passthroughModels: true,
        website: "https://dgrid.ai",
        hasFree: true,
        freeNote: "DGrid Free Models Router: 10 requests/minute and 100 requests/day. " + "A $5 lifetime top-up unlocks up to 20 requests/minute and 1,000 requests/day.",
        apiHint: "Create a DGrid API key at https://dgrid.ai, then use https://api.dgrid.ai/v1 " + "as the OpenAI-compatible base URL."
    },
    qiniu: {
        id: "qiniu",
        alias: "qiniu",
        name: "Qiniu",
        icon: "cloud",
        color: "#1E88E5",
        textIcon: "QN",
        passthroughModels: true,
        website: "https://www.qiniu.com",
        apiHint: "Create a Qiniu AI inference API key at https://portal.qiniu.com/ai-inference/api-key, " + "then paste it here as a Bearer token. OpenAI-compatible endpoint " + "at https://api.qnaigc.com/v1, proxying DeepSeek, Claude, Kimi and more behind one key."
    },
    orcarouter: {
        id: "orcarouter",
        alias: "orcarouter",
        name: "OrcaRouter",
        icon: "router",
        color: "#0891B2",
        textIcon: "ORC",
        passthroughModels: true,
        website: "https://www.orcarouter.ai",
        apiHint: "Create an API key (starts with sk-orca-) at https://www.orcarouter.ai, then paste it as a Bearer token. OpenAI-compatible endpoint at https://api.orcarouter.ai/v1."
    },
    "api-airforce": {
        id: "api-airforce",
        alias: "af",
        name: "Api.airforce",
        icon: "flight",
        color: "#1E3A5F",
        textIcon: "AF",
        website: "https://api.airforce",
        hasFree: true,
        freeNote: "55 free tier models including Grok-3, Claude 3.7, Qwen3, Kimi-K2, Gemini 2.5 Flash, DeepSeek-V3",
        apiHint: "Get your API key from https://panel.api.airforce — OpenAI-compatible endpoint at https://api.airforce/v1"
    },
    crof: {
        id: "crof",
        alias: "crof",
        name: "CrofAI",
        icon: "auto_awesome",
        color: "#0EA5E9",
        textIcon: "CR",
        website: "https://crof.ai"
    },
    bazaarlink: {
        id: "bazaarlink",
        alias: "bzl",
        name: "BazaarLink",
        icon: "storefront",
        color: "#6366F1",
        textIcon: "BZ",
        website: "https://bazaarlink.ai",
        hasFree: true,
        freeNote: "Free tier: 4M tokens/day per account with auto:free routing — zero-cost inference, no credit card required.",
        authHint: "Use your BazaarLink API key (starts with sk-bl-) in Authorization: Bearer <key>. OpenAI SDK works with base URL https://bazaarlink.ai/api/v1. Models use provider/model-name format.",
        apiHint: "Create a free API key at https://bazaarlink.ai — model 'auto:free' routes to zero-cost inference. All models use the provider/model-name format, e.g. xiaomi/mimo-v2.5-pro."
    },
    synthetic: {
        id: "synthetic",
        alias: "synthetic",
        name: "Synthetic",
        icon: "verified_user",
        color: "#6366F1",
        textIcon: "SY",
        website: "https://synthetic.new",
        passthroughModels: true
    },
    "kilo-gateway": {
        id: "kilo-gateway",
        alias: "kg",
        name: "Kilo Gateway",
        icon: "hub",
        color: "#617A91",
        textIcon: "KG",
        website: "https://kilo.ai",
        passthroughModels: true
    },
    wafer: {
        id: "wafer",
        alias: "wafer",
        name: "Wafer AI",
        icon: "layers",
        color: "#6366F1",
        textIcon: "WF",
        website: "https://wafer.ai",
        apiHint: "API key from https://wafer.ai"
    },
    "opencode-zen": {
        id: "opencode-zen",
        alias: "opencode-zen",
        name: "OpenCode Zen",
        icon: "opencode",
        color: "#6366f1",
        website: "https://opencode.ai/zen",
        anonymousFallback: true
    },
    "opencode-go": {
        id: "opencode-go",
        alias: "opencode-go",
        name: "OpenCode Go",
        icon: "opencode",
        color: "#6366f1",
        website: "https://opencode.ai/go",
        anonymousFallback: true
    },
    dahl: {
        id: "dahl",
        alias: "dahl",
        name: "Dahl",
        icon: "dahl",
        color: "#6B7280",
        textIcon: "DA",
        website: "https://inference.dahl.global",
        hasFree: true,
        freeNote: "Free — MiniMax M2.7, Kimi K2.6. Click 'Add Account' to auto-generate a token, or add your own API key.",
        authHint: "Click 'Add Account' to auto-generate a token, or add a manual API key.",
        apiHint: "Auto-generate a token or paste your own API key.",
        apiKeyUrl: "https://inference.dahl.global/tokens",
        passthroughModels: false,
        managedAccount: true,
        notice: {
            text: "Dahl auto-generates tokens via https://inference.dahl.global/tokens. No signup needed. Rate limits apply. You can also add your own API key."
        }
    },
    puter: {
        id: "puter",
        alias: "pu",
        name: "Puter AI",
        icon: "cloud_circle",
        color: "#6366F1",
        textIcon: "PU",
        website: "https://puter.com",
        hasFree: true,
        freeNote: "500+ models (GPT-5, Claude Opus 4, Gemini 3 Pro, Grok 4, DeepSeek V3...) — Users pay via free Puter account",
        passthroughModels: true,
        authHint: "Get token at puter.com/dashboard → Copy Auth Token"
    },
    uncloseai: {
        id: "uncloseai",
        alias: "unc",
        name: "UncloseAI",
        icon: "auto_awesome",
        color: "#8B5CF6",
        textIcon: "UN",
        website: "https://uncloseai.com",
        hasFree: true,
        freeNote: "Free forever — no signup, no credit card. OpenAI-compatible endpoints.",
        passthroughModels: true,
        authHint: "No auth required. API accepts any non-empty string as key for identification."
    },
    hackclub: {
        id: "hackclub",
        alias: "hc",
        name: "Hackclub AI",
        icon: "auto_awesome",
        color: "#FF6B00",
        textIcon: "HC",
        website: "https://ai.hackclub.com",
        hasFree: true,
        freeNote: "Free AI for Hack Club members — 30+ models, no credit card.",
        passthroughModels: true,
        authHint: "Sign in with your Hack Club account at ai.hackclub.com."
    },
    freetheai: {
        id: "freetheai",
        alias: "fta",
        name: "FreeTheAi",
        icon: "hub",
        color: "#22C55E",
        textIcon: "FTA",
        website: "https://freetheai.xyz",
        hasFree: true,
        freeNote: "Free OpenAI-compatible gateway — sign up via Discord for an API key.",
        passthroughModels: true,
        authHint: "Join the FreeTheAi Discord to get your free API key."
    },
    "g4f-groq": {
        id: "g4f-groq",
        alias: "g4fgroq",
        name: "g4f.space — Groq",
        icon: "bolt",
        color: "#F97316",
        textIcon: "G4F",
        website: "https://g4f.space",
        hasFree: true,
        freeNote: "Free no-key reverse proxy to Groq (gpt4free project) — rate-limited to 5 req/min.",
        passthroughModels: true,
        authHint: "No auth required. Free tier is limited to 5 requests/minute — sign up at g4f.dev/members.html for higher limits."
    },
    "g4f-gemini": {
        id: "g4f-gemini",
        alias: "g4fgem",
        name: "g4f.space — Gemini",
        icon: "bolt",
        color: "#F97316",
        textIcon: "G4F",
        website: "https://g4f.space",
        hasFree: true,
        freeNote: "Free no-key reverse proxy to Gemini (gpt4free project) — rate-limited to 5 req/min.",
        passthroughModels: true,
        authHint: "No auth required. Free tier is limited to 5 requests/minute — sign up at g4f.dev/members.html for higher limits."
    },
    "g4f-pollinations": {
        id: "g4f-pollinations",
        alias: "g4fpol",
        name: "g4f.space — Pollinations",
        icon: "bolt",
        color: "#F97316",
        textIcon: "G4F",
        website: "https://g4f.space",
        hasFree: true,
        freeNote: "Free no-key reverse proxy to Pollinations (gpt4free project) — rate-limited to 5 req/min.",
        passthroughModels: true,
        authHint: "No auth required. Free tier is limited to 5 requests/minute — sign up at g4f.dev/members.html for higher limits."
    },
    "g4f-ollama": {
        id: "g4f-ollama",
        alias: "g4foll",
        name: "g4f.space — Ollama",
        icon: "bolt",
        color: "#F97316",
        textIcon: "G4F",
        website: "https://g4f.space",
        hasFree: true,
        freeNote: "Free no-key hosted Ollama gateway (gpt4free project) — rate-limited to 5 req/min.",
        passthroughModels: true,
        authHint: "No auth required. Free tier is limited to 5 requests/minute — sign up at g4f.dev/members.html for higher limits."
    },
    "g4f-nvidia": {
        id: "g4f-nvidia",
        alias: "g4fnv",
        name: "g4f.space — NVIDIA",
        icon: "bolt",
        color: "#F97316",
        textIcon: "G4F",
        website: "https://g4f.space",
        hasFree: true,
        freeNote: "Free no-key reverse proxy to NVIDIA NIM (gpt4free project) — rate-limited to 5 req/min.",
        passthroughModels: true,
        authHint: "No auth required. Free tier is limited to 5 requests/minute — sign up at g4f.dev/members.html for higher limits."
    },
    "vercel-ai-gateway": {
        id: "vercel-ai-gateway",
        alias: "vag",
        name: "Vercel AI Gateway",
        icon: "route",
        color: "#111827",
        textIcon: "VAI",
        website: "https://vercel.com/docs/ai-gateway"
    },
    llm7: {
        id: "llm7",
        alias: "llm7",
        name: "LLM7.io",
        icon: "hub",
        color: "#6366F1",
        textIcon: "LM",
        website: "https://llm7.io",
        hasFree: true,
        freeNote: "No signup required - 2 req/s, 20 RPM, 100 req/hr free tier",
        apiHint: "Works without API key (use 'unused' as key). Get free token at token.llm7.io for higher limits."
    },
    llamagate: {
        id: "llamagate",
        alias: "llamagate",
        name: "LlamaGate",
        icon: "gate",
        color: "#16A34A",
        textIcon: "LG",
        website: "https://llamagate.ai"
    },
    gitlawb: {
        id: "gitlawb",
        alias: "glb",
        name: "Gitlawb Opengateway (MiMo)",
        icon: "hub",
        color: "#10B981",
        textIcon: "GLB",
        website: "https://opengateway.gitlawb.com",
        hasFree: false,
        freeNote: "Free MiMo (xiaomi/mimo-v2.5) revoked 2026-05 — Opengateway is now a pay-as-you-go credit gateway; no recurring free model.",
        apiHint: "Get your API key from Gitlawb Opengateway dashboard."
    },
    "gitlawb-gmi": {
        id: "gitlawb-gmi",
        alias: "glb-gmi",
        name: "Gitlawb Opengateway (GMI Cloud)",
        icon: "hub",
        color: "#10B981",
        textIcon: "GMI",
        website: "https://opengateway.gitlawb.com",
        hasFree: false,
        freeNote: "Free Nemotron promo ended 2026-06 — the GMI Cloud route is now pay-as-you-go credit only.",
        apiHint: "Get your API key from Gitlawb Opengateway dashboard."
    },
    nanogpt: {
        id: "nanogpt",
        alias: "nanogpt",
        name: "NanoGPT",
        icon: "chat",
        color: "#4F46E5",
        textIcon: "NG",
        website: "https://nano-gpt.com"
    },
    aimlapi: {
        id: "aimlapi",
        alias: "aiml",
        name: "AI/ML API",
        icon: "hub",
        color: "#6366F1",
        textIcon: "AI",
        website: "https://aimlapi.com",
        hasFree: false,
        freeNote: "Free tier paused (2026) — AI/ML API is now pay-as-you-go only (min $20 top-up); no recurring free credits.",
        passthroughModels: true
    },
    novita: {
        id: "novita",
        alias: "novita",
        name: "Novita AI",
        icon: "auto_awesome",
        color: "#FF4081",
        textIcon: "NV",
        website: "https://novita.ai",
        hasFree: true,
        freeNote: "$0.50 trial credits on signup (valid about 1 year)",
        passthroughModels: true
    },
    piapi: {
        id: "piapi",
        alias: "pi",
        name: "PiAPI",
        icon: "api",
        color: "#7C4DFF",
        textIcon: "PI",
        website: "https://piapi.ai",
        passthroughModels: true
    },
    getgoapi: {
        id: "getgoapi",
        alias: "ggo",
        name: "GoAPI",
        icon: "rocket_launch",
        color: "#FF6D00",
        textIcon: "GO",
        website: "https://api.getgoapi.com",
        passthroughModels: true
    },
    laozhang: {
        id: "laozhang",
        alias: "lz",
        name: "LaoZhang AI",
        icon: "hub",
        color: "#FF1744",
        textIcon: "LZ",
        website: "https://api.laozhang.ai",
        passthroughModels: true
    },
    thebai: {
        id: "thebai",
        alias: "thebai",
        name: "TheB.AI",
        icon: "hub",
        color: "#3B82F6",
        textIcon: "TB",
        website: "https://theb.ai",
        authHint: "Bearer API key for the TheB.AI OpenAI-compatible gateway.",
        passthroughModels: true
    },
    bai: {
        id: "bai",
        alias: "bai",
        name: "b.ai",
        icon: "hub",
        color: "#6366F1",
        textIcon: "BA",
        website: "https://b.ai",
        authHint: "Bearer API key for the b.ai OpenAI-compatible LLM gateway (distinct from TheB.AI). " + "Create a key at https://docs.b.ai, then use https://api.b.ai/v1 as the OpenAI-compatible base URL.",
        passthroughModels: true
    },
    fenayai: {
        id: "fenayai",
        alias: "fenayai",
        name: "FenayAI",
        icon: "hub",
        color: "#FF9800",
        textIcon: "FN",
        website: "https://fenayai.com",
        authHint: "Bearer API key for the FenayAI OpenAI-compatible gateway.",
        passthroughModels: true
    },
    empower: {
        id: "empower",
        alias: "empower",
        name: "Empower",
        icon: "hub",
        color: "#14B8A6",
        textIcon: "EM",
        website: "https://docs.empower.dev",
        authHint: "Bearer API key for the Empower OpenAI-compatible endpoint.",
        apiHint: "Empower exposes OpenAI-compatible chat on https://app.empower.dev/api/v1 with tool-calling support on empower-functions.",
        passthroughModels: true
    },
    poe: {
        id: "poe",
        alias: "poe",
        name: "Poe",
        icon: "hub",
        color: "#F97316",
        textIcon: "PO",
        website: "https://creator.poe.com/api-reference",
        authHint: "Bearer API key for the Poe OpenAI-compatible API.",
        apiHint: "Poe exposes OpenAI-compatible chat and responses on https://api.poe.com/v1, with authenticated balance checks on /usage/current_balance.",
        passthroughModels: true
    },
    chutes: {
        id: "chutes",
        alias: "chutes",
        name: "Chutes.ai",
        icon: "hub",
        color: "#06B6D4",
        textIcon: "CH",
        website: "https://chutes.ai",
        hasFree: false,
        freeNote: "No free tier as of 2026 — Chutes moved to pay-as-you-go (free Early Access ended 2026-03).",
        authHint: "Bearer API key for the Chutes OpenAI-compatible gateway.",
        passthroughModels: true
    },
    // Factory AI ("Factory Droids") subscription gateway — the same backend the
    // local `droid` CLI shells into, exposed here as an OpenAI-compatible HTTP
    // endpoint. Auth surface per https://github.com/Factory-AI/droid-sdk-typescript
    // is `FACTORY_API_KEY` (Bearer). Subscription tier uses app.factory.ai quota.
    factory: {
        id: "factory",
        alias: "factory",
        name: "Factory",
        icon: "smart_toy",
        color: "#0F172A",
        textIcon: "FA",
        website: "https://factory.ai",
        authHint: "Bearer API key for the Factory OpenAI-compatible gateway.",
        apiHint: "Get your Factory API key at https://app.factory.ai/settings/api-keys, then paste it as a Bearer token. OpenAI-compatible endpoint at https://api.factory.ai/v1.",
        passthroughModels: true
    },
    bluesminds: {
        id: "bluesminds",
        alias: "bm",
        name: "BluesMinds",
        icon: "psychology",
        color: "#3B82F6",
        textIcon: "BM",
        website: "https://www.bluesminds.com",
        hasFree: true,
        freeNote: "Free daily pi credits — supports 200+ models including GPT-4o, GPT-4.1, Claude Sonnet 4.5, Gemini 2.0 Flash, DeepSeek V4, Qwen, Kimi K2",
        apiHint: "Get your API key at https://www.bluesminds.com — OpenAI-compatible endpoint at https://api.bluesminds.com/v1 with free daily credits. VIP models (Claude Opus 4.5, Gemini 2.5 Pro) consume pi credits."
    },
    "freemodel-dev": {
        id: "freemodel-dev",
        alias: "fmd",
        name: "FreeModel.dev",
        icon: "auto_awesome",
        color: "#8B5CF6",
        textIcon: "FM",
        website: "https://freemodel.dev",
        hasFree: true,
        freeNote: "$300 free credits on signup — no credit card required. Access GPT-5.4 and GPT-5.5 (OpenAI's latest flagship models) through an OpenAI-compatible API.",
        apiHint: "Get $300 free API credits at https://freemodel.dev — no payment info required. OpenAI-compatible endpoint. GPT-5.4 and GPT-5.5 models available."
    },
    freeaiapikey: {
        id: "freeaiapikey",
        alias: "faik",
        name: "FreeAIAPIKey",
        icon: "vpn_key",
        color: "#F59E0B",
        textIcon: "FK",
        website: "https://freeaiapikey.com",
        apiHint: "Discounted API proxy for 40+ models including GPT-5, Claude Opus 4.6, Claude Sonnet 4.6, Qwen 3.5. Get your API key at https://freeaiapikey.com/dashboard. Base URL: https://freeaiapikey.com/v1."
    },
    zenmux: {
        id: "zenmux",
        alias: "zm",
        name: "ZenMux",
        icon: "neurology",
        color: "#7C3AED",
        textIcon: "ZM",
        website: "https://zenmux.ai",
        hasFree: true,
        freeNote: "Free tier includes access to Gemini 3 Flash, DeepSeek V3.2, Grok 4.1 Fast, Mistral Large, and more. Get your API key at https://zenmux.ai.",
        authHint: "Use your ZenMux API key in Authorization: Bearer <key>. ZenMux is fully OpenAI-compatible. Base URL: https://zenmux.ai/api/v1.",
        apiHint: "ZenMux exposes an OpenAI-compatible chat completions endpoint at /api/v1/chat/completions, plus Anthropic Messages (/api/anthropic/v1/messages) and Google Gemini (/api/vertex-ai) protocol surfaces. OmniRoute uses the OpenAI protocol."
    },
    openadapter: {
        id: "openadapter",
        alias: "oad",
        name: "OpenAdapter",
        icon: "hub",
        color: "#10B981",
        textIcon: "OD",
        website: "https://openadapter.dev",
        hasFree: true,
        freeNote: "Free tier with a generous quota and no credit card — 15+ open-source models with daily quota. Get your API key at https://dashboard.openadapter.in.",
        authHint: "Use your OpenAdapter API key in Authorization: Bearer sk-cv-<key>. Fully OpenAI-compatible. API base URL: https://api.openadapter.in/v1.",
        apiHint: "OpenAdapter exposes an OpenAI-compatible chat completions endpoint at https://api.openadapter.in/v1/chat/completions, aggregating 70+ open-source models (DeepSeek, Qwen, Kimi, MiniMax, GLM, Llama, Mistral, …). OmniRoute uses the OpenAI protocol."
    },
    dit: {
        id: "dit",
        alias: "dai",
        name: "DIT.ai",
        icon: "hub",
        color: "#0EA5E9",
        textIcon: "DT",
        website: "https://dit.ai",
        authHint: "Use your dit.ai API key in Authorization: Bearer <key>. Fully OpenAI-compatible — a drop-in replacement, just change the base URL to https://api.dit.ai/v1.",
        apiHint: "dit.ai (Distributed Intelligence Trade) is an OpenAI-compatible router/gateway with dynamic per-request pricing, exposing /v1/chat/completions at https://api.dit.ai/v1. OmniRoute uses the OpenAI protocol; spend/savings analytics live in the dit.ai dashboard."
    },
    tokenrouter: {
        id: "tokenrouter",
        alias: "trk",
        name: "TokenRouter",
        icon: "hub",
        color: "#F59E0B",
        textIcon: "TK",
        website: "https://tokenrouter.com",
        hasFree: true,
        freeNote: "Free tier includes the MiniMax 3 model. Get your API key at https://tokenrouter.com.",
        authHint: "Use your TokenRouter API key in Authorization: Bearer <key>. Fully OpenAI-compatible. API base URL: https://api.tokenrouter.com/v1.",
        apiHint: "TokenRouter exposes an OpenAI-compatible chat completions endpoint at https://api.tokenrouter.com/v1/chat/completions, plus a working /v1/models catalog. OmniRoute uses the OpenAI protocol."
    },
    sumopod: {
        id: "sumopod",
        alias: "sumopod",
        name: "SumoPod",
        icon: "router",
        color: "#2563EB",
        textIcon: "SP",
        passthroughModels: true,
        website: "https://ai.sumopod.com",
        authHint: "Use your SumoPod API key (sk-...) in Authorization: Bearer <key>. Fully OpenAI-compatible. API base URL: https://ai.sumopod.com/v1.",
        apiHint: "SumoPod exposes an OpenAI-compatible chat completions endpoint at https://ai.sumopod.com/v1/chat/completions, plus a live /v1/models catalog. OmniRoute uses the OpenAI protocol and lists models via passthrough."
    },
    x5lab: {
        id: "x5lab",
        alias: "x5lab",
        name: "X5Lab",
        icon: "router",
        color: "#7C3AED",
        textIcon: "X5",
        passthroughModels: true,
        website: "https://x5lab.dev",
        authHint: "Use your X5Lab API key (x5-...) in Authorization: Bearer <key>. Fully OpenAI-compatible. API base URL: https://api.x5lab.dev/v1.",
        apiHint: "X5Lab exposes an OpenAI-compatible chat completions endpoint at https://api.x5lab.dev/v1/chat/completions, plus a live /v1/models catalog. OmniRoute uses the OpenAI protocol and lists models via passthrough."
    },
    chenzk: {
        id: "chenzk",
        alias: "chenzk",
        name: "Chenzk API",
        icon: "hub",
        color: "#10B981",
        textIcon: "CZ",
        passthroughModels: true,
        website: "https://chenzk.top",
        apiHint: "Create an API key at https://chenzk.top/token, then paste it here as a Bearer token. " + "OpenAI-compatible endpoint at https://chenzk.top/v1, with a live /v1/models catalog."
    },
    kenari: {
        id: "kenari",
        alias: "kenari",
        name: "Kenari",
        icon: "hub",
        color: "#B5362A",
        textIcon: "KN",
        passthroughModels: true,
        website: "https://kenari.id",
        authHint: "Use your Kenari API key (kn-...) in Authorization: Bearer <key>. Fully OpenAI-compatible. API base URL: https://kenari.id/v1.",
        apiHint: "Kenari exposes an OpenAI-compatible chat completions endpoint at https://kenari.id/v1/chat/completions, plus a live /v1/models catalog covering Claude, GPT, DeepSeek, GLM, Kimi and more. OmniRoute uses the OpenAI protocol and lists models via passthrough."
    },
    navy: {
        id: "navy",
        alias: "navy",
        name: "NavyAI",
        icon: "hub",
        color: "#1E3A8A",
        textIcon: "NV",
        passthroughModels: true,
        website: "https://api.navy",
        hasFree: true,
        freeNote: "Free plan is one shared 150K tokens/day pool at 20 RPM. Each model carries a " + "token multiplier, so heavier models drain the pool faster (grok-4 at 10x is ~15K real tokens/day).",
        authHint: "Create a free API key from the NavyAI dashboard, then paste it here as a Bearer token.",
        apiHint: "OpenAI-compatible endpoint at https://api.navy/v1 with a live /v1/models catalog that exposes " + "per-model token_multiplier and premium flags. Upstream requires an explicit User-Agent header."
    },
    ainative: {
        id: "ainative",
        alias: "ainative",
        name: "AINative Studio",
        icon: "hub",
        color: "#7C3AED",
        textIcon: "AN",
        passthroughModels: true,
        website: "https://ainative.studio",
        hasFree: true,
        freeNote: "Free tier ~10M tokens/month (claimed) across Qwen3, Llama 4, DeepSeek R1 and more.",
        authHint: "Create a free API key at ainative.studio (no card), then paste it here as a Bearer token.",
        apiHint: "OpenAI-compatible endpoint at https://api.ainative.studio/api/v1 with a public /models catalog (84 models). OmniRoute lists models via passthrough."
    },
    aion: {
        id: "aion",
        alias: "aion",
        name: "Aion Labs",
        icon: "hub",
        color: "#0EA5E9",
        textIcon: "AI",
        passthroughModels: true,
        website: "https://www.aionlabs.ai",
        hasFree: true,
        freeNote: "Free tier ~20k tokens/day across the Aion reasoning models.",
        authHint: "Create a free API key at aionlabs.ai (no card), then paste it here as a Bearer token.",
        apiHint: "OpenAI-compatible endpoint at https://api.aionlabs.ai/v1 with a public /models catalog carrying context and pricing."
    },
    routeway: {
        id: "routeway",
        alias: "routeway",
        name: "Routeway",
        icon: "hub",
        color: "#F59E0B",
        textIcon: "RW",
        passthroughModels: true,
        website: "https://routeway.ai",
        hasFree: true,
        freeNote: "Free models (:free suffix) at ~5 RPM / 200 RPD across Llama, Nemotron, Step and Laguna.",
        authHint: "Create a free API key at routeway.ai, then paste it here as a Bearer token.",
        apiHint: "OpenAI-compatible endpoint at https://api.routeway.ai/v1 with a public /models catalog (236 models). Cloudflare fronts the API and requires a browser-style User-Agent."
    },
    nara: {
        id: "nara",
        alias: "nara",
        name: "NaraRouter",
        icon: "hub",
        color: "#EC4899",
        textIcon: "NA",
        passthroughModels: true,
        website: "https://bynara.id",
        hasFree: true,
        freeNote: "Free tier is a shared 5M tokens/day pool; some models are gated behind credit/plan.",
        authHint: "Get a free API key via NaraRouter's Telegram channel, then paste it here as a Bearer token.",
        apiHint: "OpenAI-compatible endpoint at https://router.bynara.id/v1. Free-tier models are pinned; others need credit."
    },
    regolo: {
        id: "regolo",
        alias: "regolo",
        name: "Regolo AI",
        icon: "hub",
        color: "#6366F1",
        textIcon: "RG",
        website: "https://regolo.ai",
        passthroughModels: true,
        authHint: "Get your Regolo API key from regolo.ai, then paste it here as a Bearer token.",
        apiHint: "OpenAI-compatible endpoint at https://api.regolo.ai/v1 with dynamic model discovery (19 models)."
    }
};
}),
"[project]/src/shared/constants/providers/apikey/frontier-labs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * APIKEY provider catalog — frontier-labs family (first-party frontier model labs).
 * Pure data; merged by apikey/index.ts via spread (god-file decomposition; semantic split).
 */ __turbopack_context__.s([
    "APIKEY_PROVIDERS_FRONTIER",
    ()=>APIKEY_PROVIDERS_FRONTIER
]);
const APIKEY_PROVIDERS_FRONTIER = {
    openai: {
        id: "openai",
        alias: "openai",
        name: "OpenAI",
        icon: "auto_awesome",
        color: "#10A37F",
        textIcon: "OA",
        website: "https://platform.openai.com"
    },
    reka: {
        id: "reka",
        alias: "reka",
        name: "Reka",
        icon: "auto_awesome",
        color: "#111827",
        textIcon: "RK",
        website: "https://docs.reka.ai/chat/overview",
        authHint: "Use your Reka API key. OmniRoute supports the OpenAI-compatible base URL https://api.reka.ai/v1 and sends both Authorization and X-Api-Key headers for compatibility.",
        apiHint: "Reka Chat is OpenAI-compatible on /v1. OmniRoute probes /v1/models and routes chat traffic to /v1/chat/completions.",
        hasFree: true,
        freeNote: "$10/month recurring free API credits"
    },
    pioneer: {
        id: "pioneer",
        alias: "pn",
        name: "Pioneer AI",
        icon: "rocket_launch",
        color: "#7C5CFF",
        textIcon: "PN",
        website: "https://pioneer.ai",
        notice: {
            text: "Pioneer AI by Fastino Labs. Free $75 usage credits, no credit card required. Use API key auth with a pio_sk_... key. Only open-tier models (Qwen3, Llama, Gemma, SmolLM) work directly — gated models (Claude/GPT/Gemini) require prior fine-tuning via the Pioneer platform.",
            apiKeyUrl: "https://agent.pioneer.ai/settings/api-keys",
            signupUrl: "https://agent.pioneer.ai/auth"
        },
        hasFree: true,
        freeNote: "$75 free usage credits — no credit card required",
        serviceKinds: [
            "llm"
        ]
    },
    anthropic: {
        id: "anthropic",
        alias: "anthropic",
        name: "Anthropic",
        icon: "smart_toy",
        color: "#D97757",
        textIcon: "AN",
        website: "https://platform.claude.com"
    },
    gemini: {
        id: "gemini",
        alias: "gemini",
        name: "Gemini (Google AI Studio)",
        icon: "diamond",
        color: "#4285F4",
        textIcon: "GE",
        website: "https://aistudio.google.com",
        hasFree: true,
        freeNote: "Free forever: 1,500 req/day for Gemini 2.5 Flash — no credit card, get key at aistudio.google.com"
    },
    groq: {
        id: "groq",
        alias: "groq",
        name: "Groq",
        icon: "speed",
        color: "#F55036",
        textIcon: "GQ",
        website: "https://groq.com",
        hasFree: true,
        freeNote: "Free tier: 30 RPM / 14.4K RPD — no credit card"
    },
    blackbox: {
        id: "blackbox",
        alias: "bb",
        name: "Blackbox AI",
        icon: "view_in_ar",
        color: "#1A1A2E",
        textIcon: "BB",
        website: "https://blackbox.ai",
        hasFree: true,
        freeNote: "Free tier: unlimited basic chat plus Minimax-M2.5, no credit card required"
    },
    xai: {
        id: "xai",
        alias: "xai",
        name: "xAI (Grok)",
        icon: "auto_awesome",
        color: "#1DA1F2",
        textIcon: "XA",
        website: "https://x.ai"
    },
    mistral: {
        id: "mistral",
        alias: "mistral",
        name: "Mistral",
        icon: "air",
        color: "#FF7000",
        textIcon: "MI",
        website: "https://mistral.ai",
        hasFree: true,
        freeNote: "Free Experiment tier: rate-limited access to all models, no credit card required"
    },
    perplexity: {
        id: "perplexity",
        alias: "pplx",
        name: "Perplexity",
        icon: "search",
        color: "#20808D",
        textIcon: "PP",
        website: "https://www.perplexity.ai"
    },
    cohere: {
        id: "cohere",
        alias: "cohere",
        name: "Cohere",
        icon: "hub",
        color: "#39594D",
        textIcon: "CO",
        website: "https://cohere.com",
        hasFree: true,
        freeNote: "Free Trial: 1,000 API calls/month for testing, no credit card required"
    },
    "meta-llama": {
        id: "meta-llama",
        alias: "meta",
        name: "Meta Llama API",
        icon: "smart_toy",
        color: "#0F766E",
        textIcon: "ML",
        website: "https://llama.developer.meta.com"
    },
    morph: {
        id: "morph",
        alias: "morph",
        name: "Morph",
        icon: "auto_fix_high",
        color: "#2563EB",
        textIcon: "MP",
        website: "https://morphllm.com",
        hasFree: true,
        freeNote: "Free tier: 250K credits/month, $0"
    },
    galadriel: {
        id: "galadriel",
        alias: "galadriel",
        name: "Galadriel",
        icon: "auto_awesome",
        color: "#F59E0B",
        textIcon: "GA",
        website: "https://galadriel.com",
        subscriptionRisk: true,
        riskNoticeVariant: "deprecated",
        deprecated: true,
        deprecationReason: "api.galadriel.ai no longer resolves (sweep 2026-06-19); the inference API appears discontinued."
    },
    ai21: {
        id: "ai21",
        alias: "ai21",
        name: "AI21 Labs",
        icon: "psychology_alt",
        color: "#0284C7",
        textIcon: "AI21",
        website: "https://www.ai21.com",
        hasFree: true,
        freeNote: "$10 trial credits on signup (valid 3 months), no credit card required"
    },
    venice: {
        id: "venice",
        alias: "venice",
        name: "Venice.ai",
        icon: "travel_explore",
        color: "#0EA5E9",
        textIcon: "VN",
        website: "https://venice.ai"
    },
    codestral: {
        id: "codestral",
        alias: "codestral",
        name: "Codestral",
        icon: "terminal",
        color: "#FF7000",
        textIcon: "CS",
        website: "https://mistral.ai"
    },
    upstage: {
        id: "upstage",
        alias: "upstage",
        name: "Upstage",
        icon: "trending_up",
        color: "#0F766E",
        textIcon: "UP",
        website: "https://www.upstage.ai"
    },
    maritalk: {
        id: "maritalk",
        alias: "maritalk",
        name: "Maritalk",
        icon: "translate",
        color: "#1D4ED8",
        textIcon: "MT",
        website: "https://www.maritaca.ai"
    },
    "nous-research": {
        id: "nous-research",
        alias: "nous",
        name: "Nous Research",
        icon: "hub",
        color: "#2563EB",
        textIcon: "NO",
        website: "https://portal.nousresearch.com/help",
        authHint: "Use your Nous Portal API key. OmniRoute targets the official OpenAI-compatible inference endpoint at https://inference-api.nousresearch.com/v1.",
        apiHint: "Nous exposes an OpenAI-compatible /v1 surface with a large remote /models catalog. The /chat/completions endpoint requires a valid API key for programmatic inference.",
        hasFree: true,
        freeNote: "Free tier: 50 RPM, 500,000 TPM — no credit card"
    },
    "arcee-ai": {
        id: "arcee-ai",
        alias: "arcee",
        name: "Arcee AI",
        icon: "auto_awesome",
        color: "#8B5CF6",
        textIcon: "AR",
        website: "https://arcee.ai",
        hasFree: true,
        freeNote: "Free Trinity Large Thinking model (262K context). No credit card required.",
        passthroughModels: true,
        authHint: "Get API key at arcee.ai"
    },
    liquid: {
        id: "liquid",
        alias: "liquid",
        name: "Liquid AI",
        icon: "water_drop",
        color: "#06B6D4",
        textIcon: "LQ",
        website: "https://liquid.ai",
        hasFree: true,
        freeNote: "Free LFM2.5-1.2B-Thinking and LFM2.5-1.2B-Instruct models. MIT spinoff, hybrid architecture.",
        passthroughModels: true,
        authHint: "Get API key at liquid.ai"
    },
    inception: {
        id: "inception",
        alias: "inception",
        name: "Inception",
        icon: "auto_awesome",
        color: "#F97316",
        textIcon: "IN",
        website: "https://docs.inceptionlabs.ai",
        apiHint: "Inception Labs is OpenAI-compatible at https://api.inceptionlabs.ai/v1. mercury-2 is the first diffusion LLM (dLLM) in the catalog — 5-10x faster generation than comparable autoregressive models, with tool calling, json_mode, and structured outputs.",
        hasFree: true,
        freeNote: "10M free tokens on signup, no credit card required."
    },
    writer: {
        id: "writer",
        alias: "writer",
        name: "Writer",
        icon: "auto_awesome",
        color: "#111827",
        textIcon: "WR",
        website: "https://dev.writer.com",
        apiHint: "Writer Palmyra is OpenAI-compatible at https://api.writer.com/v1. palmyra-x5 offers a 1M-token context window.",
        hasFree: false
    }
};
}),
"[project]/src/shared/constants/providers/apikey/inference-hosts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * APIKEY provider catalog — inference-hosts family (serverless GPU / OSS-model inference hosts).
 * Pure data; merged by apikey/index.ts via spread (god-file decomposition; semantic split).
 */ __turbopack_context__.s([
    "APIKEY_PROVIDERS_INFERENCE",
    ()=>APIKEY_PROVIDERS_INFERENCE
]);
const APIKEY_PROVIDERS_INFERENCE = {
    together: {
        id: "together",
        alias: "together",
        name: "Together AI",
        icon: "group_work",
        color: "#0F6FFF",
        textIcon: "TG",
        website: "https://www.together.ai",
        hasFree: false,
        notice: {
            text: "No free tier — Together AI is fully prepaid and requires a minimum $5 credit purchase (valid payment method) before API calls work. The former $25 signup credit was retired.",
            apiKeyUrl: "https://api.together.ai/settings/api-keys"
        }
    },
    // OpenVecta — OpenAI-compatible AI inference gateway (https://openvecta.com/).
    // Catalog seeded from the live /v1/models list (LLMs + embeddings); free credits
    // advertised on signup. Bearer-token auth via Authorization: Bearer ov_sk_…
    openvecta: {
        id: "openvecta",
        alias: "openvecta",
        name: "OpenVecta",
        icon: "vector_polygon",
        color: "#7C3AED",
        textIcon: "OV",
        website: "https://openvecta.com",
        hasFree: true,
        freeNote: "Free credits on signup for OpenAI-compatible inference across LLMs, embeddings, and reasoning models"
    },
    fireworks: {
        id: "fireworks",
        alias: "fireworks",
        name: "Fireworks AI",
        icon: "local_fire_department",
        color: "#7B2EF2",
        textIcon: "FW",
        website: "https://fireworks.ai",
        hasFree: true,
        freeNote: "$1 free starter credits on signup for API testing"
    },
    cerebras: {
        id: "cerebras",
        alias: "cerebras",
        name: "Cerebras",
        icon: "memory",
        color: "#FF4F00",
        textIcon: "CB",
        website: "https://inference.cerebras.ai",
        hasFree: true,
        freeNote: "Free Trial: 1M tokens/day, 30K TPM, 5 RPM — no credit card."
    },
    nvidia: {
        id: "nvidia",
        alias: "nvidia",
        name: "NVIDIA NIM",
        icon: "developer_board",
        color: "#76B900",
        textIcon: "NV",
        website: "https://build.nvidia.com",
        hasFree: true,
        freeNote: "Free dev access: ~40 RPM, 70+ models (Kimi K2.5, GLM 4.7, DeepSeek V3.2...)"
    },
    nebius: {
        id: "nebius",
        alias: "nebius",
        name: "Nebius AI",
        icon: "cloud",
        color: "#6C5CE7",
        textIcon: "NB",
        website: "https://nebius.com",
        hasFree: true,
        freeNote: "~$1 trial credits on signup for API testing"
    },
    nube: {
        id: "nube",
        alias: "nube",
        name: "Nube.sh",
        icon: "cloud",
        color: "#2563EB",
        textIcon: "NB",
        website: "https://nube.sh",
        hasFree: false,
        notice: {
            text: "OpenAI-compatible gateway (LiteLLM). Bring your own API key — models are resolved live from the account (passthrough).",
            apiKeyUrl: "https://nube.sh/dashboard/api-keys"
        }
    },
    siliconflow: {
        id: "siliconflow",
        alias: "siliconflow",
        name: "SiliconFlow",
        icon: "cloud_queue",
        color: "#5B6EF5",
        textIcon: "SF",
        website: "https://cloud.siliconflow.com",
        hasFree: true,
        freeNote: "$1 free credits plus permanently free models after identity verification"
    },
    hyperbolic: {
        id: "hyperbolic",
        alias: "hyp",
        name: "Hyperbolic",
        icon: "bolt",
        color: "#00D4FF",
        textIcon: "HY",
        website: "https://hyperbolic.xyz",
        hasFree: true,
        freeNote: "$1-5 trial credits on signup for serverless inference"
    },
    "ollama-cloud": {
        id: "ollama-cloud",
        alias: "ollamacloud",
        name: "Ollama Cloud",
        icon: "cloud",
        color: "#58A6FF",
        textIcon: "OC",
        website: "https://ollama.com/settings/keys",
        hasFree: true
    },
    huggingface: {
        id: "huggingface",
        alias: "hf",
        name: "HuggingFace",
        icon: "face",
        color: "#FFD21E",
        textIcon: "HF",
        website: "https://huggingface.co",
        hasFree: true,
        freeNote: "Free Inference API for thousands of models (Whisper, VITS, SDXL…)"
    },
    "github-models": {
        id: "github-models",
        alias: "ghm",
        name: "GitHub Models",
        icon: "code",
        color: "#238636",
        textIcon: "GH",
        website: "https://github.com/marketplace/models",
        hasFree: true,
        freeNote: "Free GPT-5, o-series, DeepSeek-R1, Llama 4, Grok 3 — GitHub account only.",
        authHint: "Create a GitHub PAT with 'models: read' scope at github.com/settings/tokens"
    },
    deepinfra: {
        id: "deepinfra",
        alias: "deepinfra",
        name: "DeepInfra",
        icon: "hub",
        color: "#2563EB",
        textIcon: "DI",
        website: "https://deepinfra.com",
        hasFree: true,
        freeNote: "Free signup credits for API testing and model exploration"
    },
    "lambda-ai": {
        id: "lambda-ai",
        alias: "lambda",
        name: "Lambda AI",
        icon: "bolt",
        color: "#7C3AED",
        textIcon: "LA",
        website: "https://lambda.ai"
    },
    sambanova: {
        id: "sambanova",
        alias: "samba",
        name: "SambaNova",
        icon: "memory",
        color: "#DC2626",
        textIcon: "SN",
        website: "https://sambanova.ai",
        hasFree: true,
        freeNote: "$5 free credits on signup (30-day validity), no credit card required"
    },
    nscale: {
        id: "nscale",
        alias: "nscale",
        name: "nScale",
        icon: "token",
        color: "#0891B2",
        textIcon: "NS",
        website: "https://nscale.com",
        hasFree: true,
        freeNote: "$5 free credits on signup for inference testing"
    },
    baseten: {
        id: "baseten",
        alias: "baseten",
        name: "Baseten",
        icon: "deployed_code",
        color: "#111827",
        textIcon: "BT",
        website: "https://baseten.co",
        hasFree: true,
        freeNote: "$30 free trial credits for GPU inference"
    },
    publicai: {
        id: "publicai",
        alias: "publicai",
        name: "PublicAI",
        icon: "public",
        color: "#059669",
        textIcon: "PA",
        website: "https://publicai.co",
        // #3558: PublicAI requires an API key (registry authType:"apikey"); signup grants a
        // one-time credit, then it bills per-model. It is NOT a keyless/free tier.
        hasFree: false,
        freeNote: "Requires an API key — one-time signup credit, then paid"
    },
    "featherless-ai": {
        id: "featherless-ai",
        alias: "featherless",
        name: "Featherless AI",
        icon: "flutter_dash",
        color: "#EA580C",
        textIcon: "FL",
        website: "https://featherless.ai",
        hasFree: true,
        freeNote: "Free tier available — no credit card required"
    },
    friendliai: {
        id: "friendliai",
        alias: "friendli",
        name: "FriendliAI",
        icon: "handshake",
        color: "#EC4899",
        textIcon: "FR",
        website: "https://friendli.ai",
        hasFree: true,
        freeNote: "Free tier for serverless inference — no credit card required"
    },
    wandb: {
        id: "wandb",
        alias: "wandb",
        name: "Weights & Biases Inference",
        icon: "monitoring",
        color: "#FFBE0B",
        textIcon: "WB",
        website: "https://wandb.ai"
    },
    "inference-net": {
        id: "inference-net",
        alias: "inet",
        name: "Inference.net",
        icon: "dns",
        color: "#2563EB",
        textIcon: "IN",
        website: "https://inference.net",
        hasFree: true,
        freeNote: "$25 free credits on signup plus research grants available"
    },
    predibase: {
        id: "predibase",
        alias: "predibase",
        name: "Predibase",
        icon: "deployed_code_history",
        color: "#0F766E",
        textIcon: "PB",
        website: "https://predibase.com",
        hasFree: false,
        freeNote: "$25 free trial credits (30-day validity)",
        subscriptionRisk: true,
        riskNoticeVariant: "deprecated",
        deprecated: true,
        deprecationReason: "serving.app.predibase.com no longer resolves (sweep 2026-06-19); the managed serving API appears discontinued."
    },
    bytez: {
        id: "bytez",
        alias: "bytez",
        name: "Bytez",
        icon: "api",
        color: "#6366F1",
        textIcon: "BZ",
        website: "https://bytez.com",
        hasFree: true,
        freeNote: "$1 free credits, refreshes every 4 weeks"
    },
    monsterapi: {
        id: "monsterapi",
        alias: "monster",
        name: "MonsterAPI",
        icon: "cloud",
        color: "#EF4444",
        textIcon: "MA",
        website: "https://monsterapi.ai",
        hasFree: true,
        freeNote: "One-time signup trial credits for decentralized GPU inference (no recurring free plan). No credit card required.",
        passthroughModels: true,
        authHint: "Get API key at monsterapi.ai",
        isDeprecated: true,
        deprecationReason: "Monster API shuttered operations on 2026-06-30. Use alternative OpenAI-compatible providers."
    },
    modelscope: {
        id: "modelscope",
        alias: "ms",
        name: "ModelScope",
        icon: "cloud",
        color: "#FF6A00",
        textIcon: "MS",
        website: "https://modelscope.cn",
        hasFree: true,
        // #1764 (upstream 9router): OpenAI-compatible API-Inference. Base URL verified
        // live against ModelScope's own docs — the upstream PR used the `.ai` TLD, but
        // the confirmed production domain is `api-inference.modelscope.cn` (see registry
        // entry + test guard).
        freeNote: "Free tier via ModelScope API-Inference — Alibaba account required."
    },
    byteplus: {
        id: "byteplus",
        alias: "bpm",
        name: "BytePlus ModelArk",
        icon: "cloud",
        color: "#2563EB",
        textIcon: "BP",
        website: "https://console.byteplus.com/ark",
        hasFree: true,
        notice: {
            text: "Free credits for new accounts. Seed 2.0, Kimi K2 Thinking, GLM 4.7, GPT-OSS-120B available.",
            apiKeyUrl: "https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey"
        },
        serviceKinds: [
            "llm"
        ]
    },
    digitalocean: {
        id: "digitalocean",
        alias: "digitalocean",
        name: "DigitalOcean",
        icon: "cloud",
        color: "#0060FF",
        textIcon: "DO",
        passthroughModels: true,
        website: "https://docs.digitalocean.com/products/ai-platform/",
        hasFree: false,
        notice: {
            text: "Use a DigitalOcean Personal Access Token (dop_v1_...) or a Model Access Key from the Inference console. OAuth tokens (doo_v1_...) may not have the required scopes.",
            apiKeyUrl: "https://cloud.digitalocean.com/account/api/tokens"
        },
        serviceKinds: [
            "llm"
        ]
    }
};
}),
"[project]/src/shared/constants/providers/apikey/enterprise-cloud.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * APIKEY provider catalog — enterprise-cloud family (hyperscaler & enterprise cloud platforms).
 * Pure data; merged by apikey/index.ts via spread (god-file decomposition; semantic split).
 */ __turbopack_context__.s([
    "APIKEY_PROVIDERS_ENTERPRISE",
    ()=>APIKEY_PROVIDERS_ENTERPRISE
]);
const APIKEY_PROVIDERS_ENTERPRISE = {
    "azure-openai": {
        id: "azure-openai",
        alias: "azure",
        name: "Azure OpenAI",
        icon: "cloud",
        color: "#0078D4",
        textIcon: "AZ",
        website: "https://azure.microsoft.com/products/ai-services/openai-service",
        authHint: "Use your Azure OpenAI API key. Base URL should be your resource endpoint, for example https://my-resource.openai.azure.com.",
        passthroughModels: true
    },
    "azure-ai": {
        id: "azure-ai",
        alias: "azure-ai",
        name: "Azure AI Foundry",
        icon: "cloud",
        color: "#2563EB",
        textIcon: "AF",
        website: "https://learn.microsoft.com/azure/ai-foundry",
        authHint: "Use your Azure AI Foundry key. Base URL can be https://<resource>.services.ai.azure.com/openai/v1/ or https://<resource>.openai.azure.com/openai/v1/.",
        apiHint: "Foundry uses the OpenAI v1 surface with deployment names as models. OmniRoute normalizes root resource URLs to the v1 chat and /models endpoints.",
        passthroughModels: true
    },
    bedrock: {
        id: "bedrock",
        alias: "bedrock",
        name: "Amazon Bedrock",
        icon: "cloud",
        color: "#FF9900",
        textIcon: "BR",
        website: "https://aws.amazon.com/bedrock",
        authHint: "Use your Amazon Bedrock API key and configure the AWS region where your models are enabled (for example eu-west-2). OmniRoute calls Bedrock's native Converse API directly.",
        apiHint: "Native Bedrock integration: model discovery uses Bedrock foundation models and inference profiles, while chat uses the regional Bedrock Runtime Converse/ConverseStream APIs.",
        passthroughModels: true
    },
    watsonx: {
        id: "watsonx",
        alias: "watsonx",
        name: "IBM watsonx.ai Gateway",
        icon: "hub",
        color: "#0F62FE",
        textIcon: "WX",
        website: "https://www.ibm.com/products/watsonx-ai",
        authHint: "Use your watsonx bearer token. Base URL can be https://<region>.ml.cloud.ibm.com/ml/gateway/v1/ or a self-managed /ml/gateway/v1 endpoint.",
        apiHint: "The watsonx model gateway exposes OpenAI-compatible /chat/completions and /models under /ml/gateway/v1.",
        passthroughModels: true
    },
    oci: {
        id: "oci",
        alias: "oci",
        name: "OCI Generative AI",
        icon: "cloud",
        color: "#C74634",
        textIcon: "OCI",
        website: "https://www.oracle.com/artificial-intelligence/generative-ai",
        authHint: "Use your OCI Generative AI API key or IAM bearer token. Base URL can be https://inference.generativeai.<region>.oci.oraclecloud.com/openai/v1/.",
        apiHint: "OCI exposes OpenAI-compatible chat and responses endpoints. Project ID is optional in OmniRoute but may be required for Responses and agentic workflows.",
        passthroughModels: true
    },
    sap: {
        id: "sap",
        alias: "sap",
        name: "SAP Generative AI Hub",
        icon: "business",
        color: "#0FAAFF",
        textIcon: "SAP",
        website: "https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core",
        authHint: "Use your SAP AI Core bearer token. Base URL can be your AI_API_URL root or a deploymentUrl from Generative AI Hub.",
        apiHint: "Model discovery uses /v2/lm/scenarios/foundation-models/models on AI_API_URL. Chat requests use deploymentUrl/chat/completions and require AI-Resource-Group.",
        passthroughModels: true
    },
    modal: {
        id: "modal",
        alias: "mdl",
        name: "Modal",
        icon: "cloud_queue",
        color: "#7C3AED",
        textIcon: "MDL",
        website: "https://modal.com/docs",
        authHint: "Use the bearer token that protects your Modal deployment, if enabled. Base URL should point to your OpenAI-compatible Modal app, for example https://<workspace>--<app>.modal.run/v1.",
        apiHint: "Modal commonly serves user-hosted OpenAI-compatible apps on /v1. OmniRoute will probe /v1/models and route chat traffic to /v1/chat/completions.",
        hasFree: true,
        freeNote: "$30/month free credits for new accounts",
        passthroughModels: true
    },
    vertex: {
        id: "vertex",
        alias: "vertex",
        name: "Vertex AI",
        icon: "cloud",
        color: "#4285F4",
        textIcon: "VA",
        website: "https://cloud.google.com/vertex-ai",
        hasFree: true,
        authHint: "Provide Service Account JSON or OAuth access_token"
    },
    "vertex-partner": {
        id: "vertex-partner",
        alias: "vp",
        name: "Vertex AI Partners",
        icon: "cloud",
        color: "#34A853",
        textIcon: "VP",
        website: "https://cloud.google.com/vertex-ai",
        authHint: "Provide the same Service Account JSON used for Vertex AI partner models."
    },
    "cloudflare-ai": {
        id: "cloudflare-ai",
        alias: "cf",
        name: "Cloudflare Workers AI",
        icon: "cloud",
        color: "#F48120",
        textIcon: "CF",
        website: "https://developers.cloudflare.com/workers-ai",
        hasFree: true,
        freeNote: "Free 10K Neurons/day: ~150 LLM responses or 500s Whisper audio — edge inference globally",
        authHint: "Requires API Token AND Account ID (found at dash.cloudflare.com)"
    },
    scaleway: {
        id: "scaleway",
        alias: "scw",
        name: "Scaleway AI",
        icon: "cloud",
        color: "#4F0599",
        textIcon: "SCW",
        website: "https://www.scaleway.com/en/docs/ai-data/generative-apis/",
        hasFree: true,
        freeNote: "1M free tokens for new accounts — EU/GDPR compliant (Paris), Qwen3 235B & Llama 70B"
    },
    ovhcloud: {
        id: "ovhcloud",
        alias: "ovh",
        name: "OVHcloud AI",
        icon: "cloud",
        color: "#2563EB",
        textIcon: "OVH",
        website: "https://www.ovhcloud.com"
    },
    heroku: {
        id: "heroku",
        alias: "heroku",
        name: "Heroku AI",
        icon: "cloud_upload",
        color: "#7C3AED",
        textIcon: "HK",
        website: "https://www.heroku.com"
    },
    databricks: {
        id: "databricks",
        alias: "databricks",
        name: "Databricks",
        icon: "table_chart",
        color: "#F97316",
        textIcon: "DB",
        website: "https://www.databricks.com"
    },
    datarobot: {
        id: "datarobot",
        alias: "datarobot",
        name: "DataRobot",
        icon: "precision_manufacturing",
        color: "#6D28D9",
        textIcon: "DR",
        website: "https://docs.datarobot.com",
        authHint: "Use your DataRobot API token. Optional Base URL can be the account root (for LLM Gateway) or a deployment URL under /api/v2/deployments/<id>.",
        apiHint: "The default gateway catalogs active models from /genai/llmgw/catalog/. Deployment URLs are also supported for direct OpenAI-compatible chat requests.",
        passthroughModels: true
    },
    clarifai: {
        id: "clarifai",
        alias: "clarifai",
        name: "Clarifai",
        icon: "hub",
        color: "#7C3AED",
        textIcon: "CF",
        website: "https://docs.clarifai.com",
        authHint: "Use your Clarifai PAT or app-specific API key. OmniRoute targets the OpenAI-compatible endpoint at https://api.clarifai.com/v2/ext/openai/v1 and authenticates with Authorization: Key <token>.",
        apiHint: "Clarifai exposes OpenAI-compatible chat, responses and /models on /v2/ext/openai/v1. Public/community models typically require a PAT; app-scoped keys only work for resources inside that app.",
        passthroughModels: true
    },
    snowflake: {
        id: "snowflake",
        alias: "snowflake",
        name: "Snowflake Cortex",
        icon: "ac_unit",
        color: "#29B5E8",
        textIcon: "SF",
        website: "https://www.snowflake.com"
    }
};
}),
"[project]/src/shared/constants/providers/apikey/regional.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * APIKEY provider catalog — regional family (China + other regional providers).
 * Pure data; merged by apikey/index.ts via spread (god-file decomposition; semantic split).
 */ __turbopack_context__.s([
    "APIKEY_PROVIDERS_REGIONAL",
    ()=>APIKEY_PROVIDERS_REGIONAL
]);
const APIKEY_PROVIDERS_REGIONAL = {
    qianfan: {
        id: "qianfan",
        alias: "qianfan",
        name: "Baidu Qianfan",
        icon: "cloud",
        color: "#2468F2",
        textIcon: "BD",
        website: "https://cloud.baidu.com/product-s/qianfan_home",
        apiHint: "Use a Qianfan API key from Baidu AI Cloud. The default endpoint is OpenAI-compatible v2."
    },
    glm: {
        id: "glm",
        alias: "glm",
        name: "GLM Coding",
        icon: "code",
        color: "#2563EB",
        textIcon: "GL",
        website: "https://z.ai/subscribe"
    },
    "glm-cn": {
        id: "glm-cn",
        alias: "glmcn",
        name: "GLM Coding (China)",
        icon: "code",
        color: "#DC2626",
        textIcon: "GC",
        website: "https://open.bigmodel.cn"
    },
    glmt: {
        id: "glmt",
        alias: "glmt",
        name: "GLM Thinking",
        icon: "psychology",
        color: "#1D4ED8",
        textIcon: "GT",
        website: "https://open.bigmodel.cn",
        apiHint: "Preset GLM profile with higher token budget, thinking enabled, and longer timeout."
    },
    "bailian-coding-plan": {
        id: "bailian-coding-plan",
        alias: "bcp",
        name: "Alibaba Token Plan",
        icon: "code",
        color: "#FF6A00",
        textIcon: "BCP",
        website: "https://www.alibabacloud.com/help/en/model-studio/token-plan-overview",
        apiHint: "Use an Alibaba Token Plan key and select its Singapore or Beijing region."
    },
    "qwen-cloud": {
        id: "qwen-cloud",
        alias: "qwc",
        name: "Qwen Cloud",
        icon: "cloud",
        color: "#615CED",
        textIcon: "QC",
        website: "https://www.qwencloud.com/",
        apiHint: "Use a Qwen Cloud API key and select its Global or Beijing region."
    },
    "qwen-cloud-token-plan": {
        id: "qwen-cloud-token-plan",
        alias: "qct",
        name: "Qwen Cloud Token Plan",
        icon: "cloud",
        color: "#615CED",
        textIcon: "QCT",
        website: "https://www.qwencloud.com/pricing/token-plan",
        apiHint: "Use a Qwen Cloud Token Plan key and select its Singapore or Beijing region."
    },
    kimi: {
        id: "kimi",
        alias: "kimi",
        name: "Kimi (Legacy Moonshot API)",
        icon: "psychology",
        color: "#1E3A8A",
        textIcon: "KM",
        // Kimi official-partnership aff link (2026-07) — see KIMI_PROVIDER_IDS in
        // featuredProviders.ts. hiddenFromDashboard, so this rarely renders, but is
        // kept in sync with moonshot's aff link for consistency.
        website: "https://platform.kimi.ai?aff=omniroute",
        hiddenFromDashboard: true
    },
    "kimi-coding-apikey": {
        id: "kimi-coding-apikey",
        alias: "kmca",
        name: "Kimi Code API Key",
        icon: "psychology",
        color: "#1E40AF",
        textIcon: "KC",
        // Kimi official-partnership aff link (2026-07) — folds into the kimi-coding
        // card (PROVIDER_CONNECTION_ALIASES in providerPageUtils.ts) so this rarely
        // renders its own header, but stays in sync with kimi-coding's aff link.
        website: "https://www.kimi.com/code?aff=omniroute",
        hiddenFromDashboard: true
    },
    minimax: {
        id: "minimax",
        alias: "minimax",
        name: "Minimax Coding",
        icon: "memory",
        color: "#7C3AED",
        textIcon: "MM",
        website: "https://www.minimax.io"
    },
    "minimax-cn": {
        id: "minimax-cn",
        alias: "minimax-cn",
        name: "Minimax (China)",
        icon: "memory",
        color: "#DC2626",
        textIcon: "MC",
        website: "https://www.minimaxi.com"
    },
    deepseek: {
        id: "deepseek",
        alias: "ds",
        name: "DeepSeek",
        icon: "bolt",
        color: "#4D6BFE",
        textIcon: "DS",
        website: "https://platform.deepseek.com",
        hasFree: true,
        freeNote: "5M free tokens on signup - no credit card required"
    },
    zai: {
        id: "zai",
        alias: "zai",
        name: "Z.AI",
        icon: "psychology",
        color: "#2563EB",
        textIcon: "ZA",
        website: "https://open.bigmodel.cn",
        apiHint: "API key from https://open.bigmodel.cn/usercenter/apikeys"
    },
    alibaba: {
        id: "alibaba",
        alias: "ali",
        name: "Alibaba Cloud Model Studio",
        icon: "cloud_queue",
        color: "#FF6600",
        textIcon: "AL",
        website: "https://bailian.console.alibabacloud.com/",
        hasFree: false,
        apiHint: "Use a Model Studio API key and select its Singapore or Beijing region."
    },
    "alibaba-cn": {
        id: "alibaba-cn",
        alias: "ali-cn",
        name: "Alibaba (China)",
        icon: "cloud_queue",
        color: "#FF6600",
        textIcon: "AL",
        website: "https://dashscope.console.aliyun.com/",
        hasFree: false,
        hiddenFromDashboard: true
    },
    longcat: {
        id: "longcat",
        alias: "lc",
        name: "LongCat AI",
        icon: "auto_awesome",
        color: "#FF6B9D",
        textIcon: "LC",
        website: "https://longcat.chat/platform/docs",
        hasFree: true,
        freeNote: "Free: one-time 10M-token grant after account signup + KYC verification (LongCat-2.0). One-time only — not a recurring daily/monthly allowance."
    },
    moonshot: {
        id: "moonshot",
        alias: "moonshot",
        // Display name only — Kimi official-partnership rebrand (2026-07). The
        // catalog id/alias/routing stay "moonshot" (DB connections, combos, and
        // /dashboard/providers/moonshot all address it by id, never by name) — see
        // KIMI_PROVIDER_IDS in featuredProviders.ts for the full id list this
        // touches. "Kimi (Legacy Moonshot API)" (id "kimi") and "Moonshot AI" in
        // company-name mentions (e.g. README, kimiOfficialSupporterTooltip) are
        // intentionally left as-is.
        name: "Kimi",
        icon: "rocket_launch",
        color: "#1E40AF",
        textIcon: "MS",
        // Kimi official-partnership aff link (2026-07): the "Kimi API Platform"
        // tracking link — was the unattributed legacy platform.moonshot.ai domain
        // (301s to platform.kimi.ai with no aff tag).
        website: "https://platform.kimi.ai?aff=omniroute"
    },
    volcengine: {
        id: "volcengine",
        alias: "volcengine",
        name: "Volcengine",
        icon: "local_fire_department",
        color: "#DC2626",
        textIcon: "VE",
        website: "https://www.volcengine.com"
    },
    gigachat: {
        id: "gigachat",
        alias: "gigachat",
        name: "GigaChat (Sber)",
        icon: "lock_person",
        color: "#10B981",
        textIcon: "GC",
        website: "https://developers.sber.ru"
    },
    "xiaomi-mimo": {
        id: "xiaomi-mimo",
        alias: "mimo",
        name: "Xiaomi MiMo",
        icon: "devices",
        color: "#EA580C",
        textIcon: "MM",
        website: "https://mimo.mi.com"
    },
    "xiaomi-mimo-token-plan": {
        id: "xiaomi-mimo-token-plan",
        alias: "mimotp",
        name: "Xiaomi MiMo Token Plan",
        icon: "devices",
        color: "#EA580C",
        textIcon: "MT",
        website: "https://mimo.mi.com"
    },
    baidu: {
        id: "baidu",
        alias: "baidu",
        name: "Baidu (ERNIE)",
        icon: "auto_awesome",
        color: "#2932E1",
        textIcon: "BD",
        website: "https://ernie.baidu.com/",
        hasFree: true,
        freeNote: "Free ERNIE Speed/Lite models. China's #2 LLM.",
        passthroughModels: true,
        authHint: "Get API key at console.bce.baidu.com"
    },
    tencent: {
        id: "tencent",
        alias: "tencent",
        name: "Tencent Hunyuan",
        icon: "auto_awesome",
        color: "#07C160",
        textIcon: "TC",
        website: "https://hunyuan.tencent.com",
        hasFree: true,
        freeNote: "Free Hunyuan Lite models. WeChat ecosystem.",
        passthroughModels: true,
        authHint: "Get API key at console.cloud.tencent.com"
    },
    iflytek: {
        id: "iflytek",
        alias: "iflytek",
        name: "iFlytek Spark",
        icon: "auto_awesome",
        color: "#0066FF",
        textIcon: "IF",
        website: "https://xinghuo.xfyun.cn",
        hasFree: true,
        freeNote: "Spark Lite is free (2 QPS rate-limited), but iFlytek ToS §2.4(3) prohibits programmatic extraction and requires Chinese real-name auth — use with caution.",
        passthroughModels: true,
        authHint: "Get API key at console.xfyun.cn"
    },
    baichuan: {
        id: "baichuan",
        alias: "baichuan",
        name: "Baichuan",
        icon: "auto_awesome",
        color: "#6366F1",
        textIcon: "BC",
        website: "https://www.baichuan-ai.com/",
        hasFree: true,
        freeNote: "Free Baichuan models. Popular Chinese LLM startup.",
        passthroughModels: true,
        authHint: "Get API key at platform.baichuan-ai.com"
    },
    yi: {
        id: "yi",
        alias: "yi",
        name: "Yi (01.AI)",
        icon: "auto_awesome",
        color: "#10B981",
        textIcon: "YI",
        website: "https://01.ai",
        hasFree: false,
        freeNote: "No free API tier (2026) — Yi-Light retired; platform.01.ai is pay-as-you-go (Yi-Lightning paid). Open weights are download-only.",
        passthroughModels: true,
        authHint: "Get API key at platform.lingyiwanwu.com"
    },
    stepfun: {
        id: "stepfun",
        alias: "stepfun",
        name: "StepFun",
        icon: "auto_awesome",
        color: "#8B5CF6",
        textIcon: "SF",
        website: "https://stepfun.com",
        hasFree: true,
        freeNote: "Free Step-2 models. Chinese AI company.",
        passthroughModels: true,
        authHint: "Get API key at platform.stepfun.com",
        // #5462 — this integration calls StepFun's China platform (api.stepfun.com),
        // whose sign-up appears to be phone-based. International users have a separate
        // global platform (platform.stepfun.ai, operated by Sparkling AI Pte Ltd,
        // Singapore) with email/Google/Discord login.
        notice: {
            text: "This connects to StepFun's China platform (platform.stepfun.com), whose sign-up appears to require a Chinese phone number. Users outside mainland China can instead register at the global StepFun Open Platform (platform.stepfun.ai, operated by Sparkling AI Pte. Ltd., Singapore) with email/Google/Discord login.",
            signupUrl: "https://platform.stepfun.ai"
        }
    },
    coze: {
        id: "coze",
        alias: "coze",
        name: "Coze",
        icon: "smart_toy",
        color: "#3B82F6",
        textIcon: "CZ",
        website: "https://coze.com",
        hasFree: true,
        freeNote: "Free ByteDance agent platform. Bot building + LLM access.",
        passthroughModels: true,
        authHint: "Get API key at coze.com/open/api"
    },
    "360ai": {
        id: "360ai",
        alias: "360ai",
        name: "360 AI",
        icon: "auto_awesome",
        color: "#00B96B",
        textIcon: "360",
        website: "https://ai.360.cn",
        hasFree: true,
        freeNote: "Free 360 AI Brain models. Major Chinese security company.",
        passthroughModels: true,
        authHint: "Get API key at ai.360.cn"
    },
    doubao: {
        id: "doubao",
        alias: "doubao",
        name: "Doubao",
        icon: "auto_awesome",
        color: "#FE2C55",
        textIcon: "DB",
        website: "https://doubao.com",
        hasFree: true,
        freeNote: "Free Doubao models. ByteDance's chatbot.",
        passthroughModels: true,
        authHint: "Get API key at console.volcengine.com"
    },
    sensenova: {
        id: "sensenova",
        alias: "sensenova",
        name: "SenseNova",
        icon: "auto_awesome",
        color: "#0066FF",
        textIcon: "SN",
        website: "https://platform.sensenova.cn",
        hasFree: true,
        freeNote: "Free SenseTime models. Computer vision leader.",
        passthroughModels: true,
        authHint: "Get API key at platform.sensenova.cn",
        // #5462 — SenseNova's console (platform.sensenova.cn) appears to require a
        // Chinese (+86) phone number for SMS-verified registration, with no documented
        // international sign-up path. Warn users outside mainland China up front.
        notice: {
            text: "SenseNova registration appears to require a Chinese (+86) phone number for SMS verification — no international sign-up path is documented, so users outside mainland China may be unable to obtain an API key.",
            signupUrl: "https://platform.sensenova.cn/console"
        }
    },
    sparkdesk: {
        id: "sparkdesk",
        alias: "sparkdesk",
        name: "SparkDesk",
        icon: "auto_awesome",
        color: "#0066FF",
        textIcon: "SD",
        website: "https://xinghuo.xfyun.cn",
        hasFree: true,
        freeNote: "Spark Lite free (alias for iflytek), but ToS restricts to personal/non-commercial use and prohibits relaying access to third parties — use with caution.",
        passthroughModels: true,
        authHint: "Get API key at console.xfyun.cn"
    },
    hcnsec: {
        id: "hcnsec",
        alias: "hcnsec",
        name: "Huancheng Public API",
        icon: "security",
        color: "#0EA5E9",
        textIcon: "HC",
        website: "https://api.hcnsec.cn",
        hasFree: true,
        freeNote: "Xinjiang Huancheng Cybersecurity public LLM API platform: free credits with daily check-ins.",
        passthroughModels: true,
        authHint: "Get API key at api.hcnsec.cn"
    },
    agnes: {
        id: "agnes",
        alias: "agnes",
        name: "Agnes AI",
        icon: "auto_awesome",
        color: "#10B981",
        textIcon: "AG",
        website: "https://agnes-ai.com",
        hasFree: true,
        freeNote: "Permanently free API - no credit card required.",
        authHint: "Get API key at agnes-ai.com"
    },
    sealion: {
        id: "sealion",
        alias: "sealion",
        name: "SEA-LION",
        icon: "public",
        color: "#0D9488",
        textIcon: "SL",
        website: "https://sea-lion.ai",
        hasFree: true,
        freeNote: "Permanently free at 10 RPM — AI Singapore's Southeast-Asian models (Llama/Qwen/Gemma SEA-LION).",
        authHint: "Sign in at sea-lion.ai with Google (no card, no region wall), create an API key, then paste it here."
    },
    "clova-studio": {
        id: "clova-studio",
        alias: "clova",
        name: "Naver CLOVA Studio",
        icon: "auto_awesome",
        color: "#03C75A",
        textIcon: "CS",
        website: "https://api.ncloud-docs.com/docs/en/ai-naver-clovastudio-summary",
        apiHint: "CLOVA Studio (HyperCLOVA X) is OpenAI-compatible on /v1/openai. OmniRoute probes /v1/openai/models and routes chat traffic to /v1/openai/chat/completions. Uses the current clovastudio.stream.ntruss.com host — the legacy clovastudio.apigw.ntruss.com endpoint is being deprecated."
    },
    internlm: {
        id: "internlm",
        alias: "internlm",
        name: "InternLM (Intern-S1)",
        icon: "auto_awesome",
        color: "#4F46E5",
        textIcon: "IL",
        website: "https://internlm.intern-ai.org.cn/",
        hasFree: true,
        freeNote: "Free monthly quota ~1M input / 3M output tokens (~10 RPM)"
    },
    "ant-ling": {
        id: "ant-ling",
        alias: "ling",
        name: "Ant Ling / Ring (inclusionAI)",
        icon: "auto_awesome",
        color: "#1677FF",
        textIcon: "AL",
        website: "https://developer.ant-ling.com/en/docs/",
        hasFree: true,
        freeNote: "500,000 free tokens per day per account (resets 02:00 UTC+8, no rollover)",
        authHint: "Register and create an API key at the Ant Ling API console (https://chat.ant-ling.com/open), then paste it here. OmniRoute routes chat traffic to https://api.ant-ling.com/v1/chat/completions; the provider is OpenAI-compatible and also exposes an Anthropic-compatible surface."
    },
    sarvam: {
        id: "sarvam",
        alias: "sarvam",
        name: "Sarvam AI",
        icon: "public",
        color: "#0EA5E9",
        textIcon: "SV",
        website: "https://docs.sarvam.ai",
        apiHint: "Sarvam AI is OpenAI-compatible on /v1. OmniRoute probes /v1/models and routes chat traffic to /v1/chat/completions. Models are tuned for Indic languages.",
        hasFree: true,
        freeNote: "₹1,000 in free signup credits — never expire"
    },
    plamo: {
        id: "plamo",
        alias: "plamo",
        name: "PLaMo",
        icon: "public",
        color: "#DC2626",
        textIcon: "PL",
        website: "https://plamo.preferredai.jp/api",
        apiHint: "PLaMo is OpenAI-compatible at https://api.platform.preferredai.jp/v1. Built by Preferred Networks and optimized for Japanese. Docs are primarily in Japanese.",
        hasFree: false
    },
    typhoon: {
        id: "typhoon",
        alias: "typhoon",
        name: "Typhoon",
        icon: "public",
        color: "#7C3AED",
        textIcon: "TY",
        website: "https://docs.opentyphoon.ai",
        apiHint: "Typhoon is OpenAI-compatible on /v1. Built by SCB 10X (Thailand); typhoon-v2.5-30b-a3b-instruct is a thai-first, multilingual model.",
        hasFree: true,
        freeNote: "Free API key with a 5 req/s and 200 req/m rate limit."
    }
};
}),
"[project]/src/shared/constants/providers/apikey/specialty-media.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * APIKEY provider catalog — specialty-media family (image / video / audio / embeddings / rerank / reader / coding tools).
 * Pure data; merged by apikey/index.ts via spread (god-file decomposition; semantic split).
 */ __turbopack_context__.s([
    "APIKEY_PROVIDERS_SPECIALTY",
    ()=>APIKEY_PROVIDERS_SPECIALTY
]);
const APIKEY_PROVIDERS_SPECIALTY = {
    nlpcloud: {
        id: "nlpcloud",
        alias: "nlpc",
        name: "NLP Cloud",
        icon: "psychology",
        color: "#2196F3",
        textIcon: "NLPC",
        website: "https://docs.nlpcloud.com",
        authHint: "Use your NLP Cloud API key in Authorization: Token <key>. OmniRoute targets the chatbot endpoint on https://api.nlpcloud.io/v1/gpu/<model>/chatbot by default.",
        apiHint: "NLP Cloud uses a proprietary chatbot API instead of OpenAI chat/completions. OmniRoute adapts OpenAI messages to input/context/history and exposes a local catalog of supported chatbot models.",
        hasFree: true,
        freeNote: "Trial credits for new accounts"
    },
    runwayml: {
        id: "runwayml",
        alias: "runway",
        name: "Runway",
        icon: "movie",
        color: "#111827",
        textIcon: "RW",
        website: "https://docs.dev.runwayml.com",
        authHint: "Use your Runway API key in Authorization: Bearer <key>. OmniRoute targets the current Runway API at https://api.dev.runwayml.com/v1 and sends the required X-Runway-Version header automatically.",
        apiHint: "Runway video generation is task-based. OmniRoute submits text-to-video or image-to-video jobs, polls /v1/tasks/{id}, and normalizes the finished video outputs back into the OpenAI-like /v1/videos/generations response."
    },
    kie: {
        id: "kie",
        alias: "kie",
        name: "KIE.AI",
        icon: "hub",
        color: "#2563EB",
        textIcon: "KIE",
        website: "https://kie.ai"
    },
    pollinations: {
        id: "pollinations",
        alias: "pol",
        name: "Pollinations AI",
        icon: "local_florist",
        color: "#4CAF50",
        textIcon: "PO",
        website: "https://pollinations.ai",
        hasFree: true,
        anonymousFallback: true,
        freeNote: "Free keyless tier: openai, openai-fast, openai-large, qwen-coder, mistral, deepseek, grok, gemini-flash-lite-3.1, perplexity-fast, perplexity-reasoning. Premium models (claude, gemini, midijourney) require a Pollinations API key from enter.pollinations.ai."
    },
    haiper: {
        id: "haiper",
        alias: "hp",
        name: "Haiper",
        icon: "videocam",
        color: "#6366F1",
        textIcon: "HP",
        website: "https://haiper.ai",
        authHint: "Get API key at haiper.ai/haiper-api"
    },
    leonardo: {
        id: "leonardo",
        alias: "leo",
        name: "Leonardo AI",
        icon: "palette",
        color: "#8B5CF6",
        textIcon: "LE",
        website: "https://leonardo.ai",
        authHint: "Get API key at leonardo.ai/developer"
    },
    ideogram: {
        id: "ideogram",
        alias: "ideo",
        name: "Ideogram",
        icon: "image",
        color: "#EC4899",
        textIcon: "ID",
        website: "https://ideogram.ai",
        authHint: "Get API key at ideogram.ai/docs/api"
    },
    freepik: {
        id: "freepik",
        alias: "fpk",
        name: "Freepik (Mystic)",
        icon: "image",
        color: "#1B9E7F",
        textIcon: "FP",
        website: "https://freepik.com",
        authHint: "Get API key at freepik.com/developers (Mystic image endpoint)",
        hasFree: true,
        freeNote: "One-time ~€5 API credit for new accounts; pay-per-use afterward."
    },
    suno: {
        id: "suno",
        alias: "suno",
        name: "Suno",
        icon: "music_note",
        color: "#F59E0B",
        textIcon: "SU",
        website: "https://suno.ai",
        authHint: "Paste session cookie from suno.ai (Clerk auth)"
    },
    udio: {
        id: "udio",
        alias: "udio",
        name: "Udio",
        icon: "music_note",
        color: "#10B981",
        textIcon: "UD",
        website: "https://udio.com",
        authHint: "Paste session cookie from udio.com (Supabase auth)"
    },
    "v0-vercel": {
        id: "v0-vercel",
        alias: "v0",
        name: "v0 (Vercel)",
        icon: "code_blocks",
        color: "#111827",
        textIcon: "V0",
        website: "https://v0.dev"
    },
    gitlab: {
        id: "gitlab",
        alias: "gitlab",
        name: "GitLab Duo PAT",
        icon: "hub",
        color: "#FC6D26",
        textIcon: "GL",
        website: "https://docs.gitlab.com/user/duo_agent_platform/code_suggestions/",
        authHint: "GitLab personal access token for the public Code Suggestions API. Configure a self-hosted base URL when not using gitlab.com."
    },
    "voyage-ai": {
        id: "voyage-ai",
        alias: "voyage",
        name: "Voyage AI",
        icon: "blur_on",
        color: "#0F766E",
        textIcon: "VA",
        website: "https://www.voyageai.com",
        authHint: "Bearer API key for Voyage AI embeddings and rerank APIs.",
        hasFree: true,
        freeNote: "200M free tokens for embeddings and reranking"
    },
    "jina-ai": {
        id: "jina-ai",
        alias: "jina",
        name: "Jina AI",
        icon: "sort",
        color: "#2563EB",
        textIcon: "JA",
        website: "https://jina.ai",
        authHint: "Bearer API key for the Jina AI rerank API.",
        hasFree: true,
        freeNote: "10M free tokens on signup (non-commercial), no credit card required"
    },
    "fal-ai": {
        id: "fal-ai",
        alias: "fal",
        name: "Fal.ai",
        icon: "image",
        color: "#2563EB",
        textIcon: "FL",
        website: "https://fal.ai"
    },
    "stability-ai": {
        id: "stability-ai",
        alias: "stability",
        name: "Stability AI",
        icon: "image",
        color: "#8B5CF6",
        textIcon: "SA",
        website: "https://stability.ai"
    },
    "black-forest-labs": {
        id: "black-forest-labs",
        alias: "bfl",
        name: "Black Forest Labs",
        icon: "image",
        color: "#111827",
        textIcon: "BF",
        website: "https://blackforestlabs.ai"
    },
    recraft: {
        id: "recraft",
        alias: "recraft",
        name: "Recraft",
        icon: "image",
        color: "#EC4899",
        textIcon: "RC",
        website: "https://recraft.ai"
    },
    topaz: {
        id: "topaz",
        alias: "topaz",
        name: "Topaz",
        icon: "image",
        color: "#059669",
        textIcon: "TP",
        website: "https://topazlabs.com"
    },
    segmind: {
        id: "segmind",
        alias: "segmind",
        name: "Segmind",
        icon: "image",
        color: "#7C3AED",
        textIcon: "SG",
        website: "https://segmind.com",
        authHint: "Use your Segmind API key in the x-api-key header. OmniRoute targets https://api.segmind.com/v1/<model> and returns the generated image/video bytes directly.",
        apiHint: "Segmind exposes 200+ hosted image and video models (Flux, SDXL, SD3, Kandinsky, Wan, Hunyuan, LTX, Kling, ...) under a single POST /v1/<model> REST call per model. OmniRoute ships a curated starter subset for each modality; more models can be routed by using their Segmind slug as the model id.",
        hasFree: true,
        freeNote: "Free trial credits on signup, no credit card required (per Segmind's public docs)."
    },
    dify: {
        id: "dify",
        alias: "dify",
        name: "Dify",
        icon: "smart_toy",
        color: "#6366F1",
        textIcon: "DF",
        website: "https://dify.ai",
        hasFree: true,
        freeNote: "Free open-source AI app builder + RAG platform.",
        passthroughModels: true,
        authHint: "Get API key from your Dify instance."
    },
    nomic: {
        id: "nomic",
        alias: "nomic",
        name: "Nomic",
        icon: "hub",
        color: "#7C3AED",
        textIcon: "NM",
        website: "https://nomic.ai",
        hasFree: true,
        freeNote: "Free Nomic Embed API. Open-source embeddings, no credit card required.",
        passthroughModels: true,
        authHint: "Get API key at atlas.nomic.ai"
    },
    mixedbread: {
        id: "mixedbread",
        alias: "mxbai",
        name: "Mixedbread AI",
        icon: "hub",
        color: "#F59E0B",
        textIcon: "MB",
        website: "https://www.mixedbread.com",
        hasFree: true,
        freeNote: "Free-tier API key via signup, no credit card required.",
        authHint: "Bearer API key for the Mixedbread embeddings API."
    },
    "jina-reader": {
        id: "jina-reader",
        alias: "jr",
        name: "Jina Reader",
        icon: "menu_book",
        color: "#0EA5E9",
        textIcon: "JR",
        website: "https://jina.ai/reader",
        hasFree: true,
        notice: {
            text: "Free tier: 1M fetches/month.",
            apiKeyUrl: "https://jina.ai/api-dashboard"
        },
        serviceKinds: [
            "webFetch"
        ]
    },
    tinyfish: {
        id: "tinyfish",
        alias: "tf",
        name: "TinyFish Fetch",
        icon: "language",
        color: "#0891B2",
        textIcon: "TF",
        website: "https://docs.tinyfish.ai/fetch-api",
        notice: {
            text: "Fetch does not use TinyFish credits. Submit up to 10 URLs per request (OmniRoute fetches one URL per call).",
            apiKeyUrl: "https://agent.tinyfish.ai/api-keys"
        },
        authHint: "X-API-Key from agent.tinyfish.ai/api-keys",
        serviceKinds: [
            "webFetch"
        ]
    }
};
}),
"[project]/src/shared/constants/providers/apikey/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APIKEY_PROVIDERS",
    ()=>APIKEY_PROVIDERS
]);
/**
 * APIKEY provider catalog barrel — merges the semantic family files into one object
 * (god-file decomposition). Pure data; spread preserves every entry. Keys are now grouped
 * by provider family (was historical-accretion order); lookups are by-key so this is a
 * cosmetic-only iteration-order change (e.g. the dashboard blocked-providers grid).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$gateways$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/apikey/gateways.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$frontier$2d$labs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/apikey/frontier-labs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$inference$2d$hosts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/apikey/inference-hosts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$enterprise$2d$cloud$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/apikey/enterprise-cloud.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$regional$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/apikey/regional.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$specialty$2d$media$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/apikey/specialty-media.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const APIKEY_PROVIDERS = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$gateways$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS_GATEWAYS"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$frontier$2d$labs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS_FRONTIER"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$inference$2d$hosts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS_INFERENCE"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$enterprise$2d$cloud$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS_ENTERPRISE"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$regional$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS_REGIONAL"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$specialty$2d$media$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS_SPECIALTY"]
};
}),
"[project]/src/shared/constants/providers/local.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider catalog data — extracted from providers.ts (god-file decomposition).
 * Pure data literal; re-exported by the providers.ts barrel. No behavior change.
 */ __turbopack_context__.s([
    "LOCAL_PROVIDERS",
    ()=>LOCAL_PROVIDERS
]);
const LOCAL_PROVIDERS = {
    "ollama-local": {
        id: "ollama-local",
        alias: "ollama",
        name: "Ollama",
        icon: "pets",
        color: "#58A6FF",
        textIcon: "OL",
        website: "https://ollama.com",
        authHint: "No API key required. Ollama runs locally — configure its OpenAI-compatible base URL (default: http://localhost:11434/v1) and make sure Ollama is running before connecting.",
        localDefault: "http://localhost:11434/v1",
        passthroughModels: true
    },
    "lm-studio": {
        id: "lm-studio",
        alias: "lmstudio",
        name: "LM Studio",
        icon: "server",
        color: "#4A148C",
        textIcon: "LM",
        website: "https://lmstudio.ai",
        authHint: "API key optional. Configure the local LM Studio OpenAI-compatible base URL (default: http://localhost:1234/v1).",
        localDefault: "http://localhost:1234/v1",
        passthroughModels: true
    },
    vllm: {
        id: "vllm",
        alias: "vllm",
        name: "vLLM",
        icon: "memory",
        color: "#0F766E",
        textIcon: "VL",
        website: "https://github.com/vllm-project/vllm",
        authHint: "API key optional. Configure the local vLLM OpenAI-compatible base URL (default: http://localhost:8000/v1).",
        localDefault: "http://localhost:8000/v1",
        passthroughModels: true
    },
    lemonade: {
        id: "lemonade",
        alias: "lemonade",
        name: "Lemonade Server",
        icon: "bolt",
        color: "#F59E0B",
        textIcon: "LM",
        website: "https://lemonade-server.ai",
        authHint: "API key optional. Configure the local Lemonade OpenAI-compatible base URL (default: http://localhost:13305/api/v1).",
        localDefault: "http://localhost:13305/api/v1",
        passthroughModels: true
    },
    llamafile: {
        id: "llamafile",
        alias: "llamafile",
        name: "Llamafile",
        icon: "article",
        color: "#EA580C",
        textIcon: "LF",
        website: "https://github.com/Mozilla-Ocho/llamafile",
        authHint: "API key optional. Configure the local Llamafile OpenAI-compatible base URL (default: http://127.0.0.1:8080/v1).",
        localDefault: "http://127.0.0.1:8080/v1",
        passthroughModels: true
    },
    "llama-cpp": {
        id: "llama-cpp",
        alias: "llamacpp",
        name: "llama.cpp",
        icon: "memory",
        color: "#795548",
        textIcon: "LC",
        website: "https://github.com/ggml-org/llama.cpp",
        authHint: "API key optional (use any value, e.g. sk-no-key-required). Configure the llama-server OpenAI-compatible base URL (default: http://127.0.0.1:8080/v1). Note: if Llamafile is also installed, both default to port 8080 — run only one at a time or override the port.",
        localDefault: "http://127.0.0.1:8080/v1",
        passthroughModels: true
    },
    triton: {
        id: "triton",
        alias: "triton",
        name: "NVIDIA Triton",
        icon: "developer_board",
        color: "#76B900",
        textIcon: "TR",
        website: "https://developer.nvidia.com/triton-inference-server",
        authHint: "API key optional. Configure the Triton OpenAI-compatible base URL (default: http://localhost:8000/v1).",
        localDefault: "http://localhost:8000/v1",
        passthroughModels: true
    },
    "docker-model-runner": {
        id: "docker-model-runner",
        alias: "dmr",
        name: "Docker Model Runner",
        icon: "inventory_2",
        color: "#2496ED",
        textIcon: "DM",
        website: "https://docs.docker.com/ai/model-runner/",
        authHint: "API key optional. Configure the local Docker Model Runner OpenAI-compatible base URL (default: http://localhost:12434/v1).",
        localDefault: "http://localhost:12434/v1",
        passthroughModels: true
    },
    xinference: {
        id: "xinference",
        alias: "xinference",
        name: "XInference",
        icon: "hub",
        color: "#DC2626",
        textIcon: "XI",
        website: "https://inference.readthedocs.io",
        authHint: "API key optional. Configure the local XInference OpenAI-compatible base URL (default: http://localhost:9997/v1).",
        localDefault: "http://localhost:9997/v1",
        passthroughModels: true
    },
    oobabooga: {
        id: "oobabooga",
        alias: "ooba",
        name: "oobabooga",
        icon: "dns",
        color: "#8B5CF6",
        textIcon: "OO",
        website: "https://github.com/oobabooga/text-generation-webui",
        authHint: "API key optional. Configure the local oobabooga OpenAI-compatible base URL (default: http://localhost:5000/v1).",
        localDefault: "http://localhost:5000/v1",
        passthroughModels: true
    },
    sdwebui: {
        id: "sdwebui",
        alias: "sdwebui",
        name: "SD WebUI",
        icon: "brush",
        color: "#FF7043",
        textIcon: "SD",
        website: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
        hasFree: true,
        authHint: "No API key required. Configure the local WebUI base URL (default: http://localhost:7860).",
        localDefault: "http://localhost:7860"
    },
    comfyui: {
        id: "comfyui",
        alias: "comfyui",
        name: "ComfyUI",
        icon: "account_tree",
        color: "#4CAF50",
        textIcon: "CF",
        website: "https://github.com/comfyanonymous/ComfyUI",
        hasFree: true,
        authHint: "No API key required. Configure the local ComfyUI base URL (default: http://localhost:8188).",
        localDefault: "http://localhost:8188"
    }
};
}),
"[project]/src/shared/constants/providers/search.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider catalog data — extracted from providers.ts (god-file decomposition).
 * Pure data literal; re-exported by the providers.ts barrel. No behavior change.
 */ __turbopack_context__.s([
    "SEARCH_PROVIDERS",
    ()=>SEARCH_PROVIDERS
]);
const SEARCH_PROVIDERS = {
    "perplexity-search": {
        id: "perplexity-search",
        alias: "pplx-search",
        name: "Perplexity Search",
        icon: "search",
        color: "#20808D",
        textIcon: "PS",
        website: "https://docs.perplexity.ai/guides/search-quickstart",
        authHint: "Same API key as Perplexity (pplx-...)"
    },
    "serper-search": {
        id: "serper-search",
        alias: "serper-search",
        name: "Serper Search",
        icon: "search",
        color: "#4285F4",
        textIcon: "SP",
        website: "https://serper.dev",
        hasFree: true,
        authHint: "API key from serper.dev dashboard",
        serviceKinds: [
            "webSearch"
        ]
    },
    "brave-search": {
        id: "brave-search",
        alias: "brave-search",
        name: "Brave Search",
        icon: "travel_explore",
        color: "#FB542B",
        textIcon: "BR",
        website: "https://brave.com/search/api",
        hasFree: true,
        authHint: "Subscription token from Brave Search API dashboard"
    },
    "exa-search": {
        id: "exa-search",
        alias: "exa-search",
        name: "Exa Search",
        icon: "neurology",
        color: "#1E40AF",
        textIcon: "EX",
        website: "https://exa.ai",
        hasFree: true,
        authHint: "API key from dashboard.exa.ai",
        serviceKinds: [
            "webSearch",
            "webFetch"
        ]
    },
    "tavily-search": {
        id: "tavily-search",
        alias: "tavily-search",
        name: "Tavily Search",
        icon: "manage_search",
        color: "#5B4FDB",
        textIcon: "TV",
        website: "https://tavily.com",
        hasFree: true,
        authHint: "API key from app.tavily.com (format: tvly-...)",
        serviceKinds: [
            "webSearch",
            "webFetch"
        ]
    },
    firecrawl: {
        id: "firecrawl",
        alias: "fc",
        name: "Firecrawl",
        icon: "language",
        color: "#FB923C",
        textIcon: "FC",
        website: "https://firecrawl.dev",
        hasFree: true,
        authHint: "API key from firecrawl.dev/app/api-keys (or set your self-hosted Firecrawl base URL)",
        notice: {
            text: "Free tier: 1,000 credits/month. Powers /v1/web/fetch and /v1/search.",
            apiKeyUrl: "https://firecrawl.dev/app/api-keys"
        },
        serviceKinds: [
            "webSearch",
            "webFetch"
        ]
    },
    "google-pse-search": {
        id: "google-pse-search",
        alias: "google-pse",
        name: "Google Programmable Search",
        icon: "travel_explore",
        color: "#4285F4",
        textIcon: "GP",
        website: "https://developers.google.com/custom-search/v1/overview",
        authHint: "Requires a Google API key and your Programmable Search Engine ID (cx)"
    },
    "linkup-search": {
        id: "linkup-search",
        alias: "linkup",
        name: "Linkup Search",
        icon: "public",
        color: "#0F766E",
        textIcon: "LU",
        website: "https://docs.linkup.so",
        authHint: "Bearer API key from the Linkup dashboard"
    },
    "searchapi-search": {
        id: "searchapi-search",
        alias: "searchapi",
        name: "SearchAPI",
        icon: "manage_search",
        color: "#2563EB",
        textIcon: "SA",
        website: "https://www.searchapi.io/docs/google",
        authHint: "API key from SearchAPI (query param or Bearer auth)"
    },
    "youcom-search": {
        id: "youcom-search",
        alias: "youcom-search",
        name: "You.com Search",
        icon: "travel_explore",
        color: "#2563EB",
        textIcon: "YOU",
        website: "https://you.com/business/api/",
        authHint: "X-API-Key from the You.com platform dashboard"
    },
    "searxng-search": {
        id: "searxng-search",
        alias: "searxng",
        name: "SearXNG Search",
        icon: "search",
        color: "#1A237E",
        textIcon: "SX",
        website: "https://docs.searxng.org",
        hasFree: true,
        authHint: "API key is optional. Set your SearXNG base URL. Some instances may require a bearer token for access."
    },
    "ollama-search": {
        id: "ollama-search",
        alias: "ollama-search",
        name: "Ollama Search",
        icon: "search",
        color: "#58A6FF",
        textIcon: "OS",
        website: "https://ollama.com/settings/keys",
        authHint: "Same API key as Ollama Cloud (from ollama.com/settings/keys)"
    }
};
}),
"[project]/src/shared/constants/providers/audio.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider catalog data — extracted from providers.ts (god-file decomposition).
 * Pure data literal; re-exported by the providers.ts barrel. No behavior change.
 */ __turbopack_context__.s([
    "AUDIO_ONLY_PROVIDERS",
    ()=>AUDIO_ONLY_PROVIDERS
]);
const AUDIO_ONLY_PROVIDERS = {
    deepgram: {
        id: "deepgram",
        alias: "dg",
        name: "Deepgram",
        icon: "mic",
        color: "#13EF93",
        textIcon: "DG",
        website: "https://deepgram.com"
    },
    assemblyai: {
        id: "assemblyai",
        alias: "aai",
        name: "AssemblyAI",
        icon: "record_voice_over",
        color: "#0062FF",
        textIcon: "AA",
        website: "https://assemblyai.com"
    },
    elevenlabs: {
        id: "elevenlabs",
        alias: "el",
        name: "ElevenLabs",
        icon: "record_voice_over",
        color: "#6C47FF",
        textIcon: "EL",
        website: "https://elevenlabs.io"
    },
    cartesia: {
        id: "cartesia",
        alias: "cartesia",
        name: "Cartesia",
        icon: "spatial_audio",
        color: "#FF4F8B",
        textIcon: "CA",
        website: "https://cartesia.ai"
    },
    fishaudio: {
        id: "fishaudio",
        alias: "fishaudio",
        name: "Fish Audio",
        icon: "graphic_eq",
        color: "#3B82F6",
        textIcon: "FA",
        website: "https://fish.audio"
    },
    playht: {
        id: "playht",
        alias: "playht",
        name: "PlayHT",
        icon: "play_circle",
        color: "#00B4D8",
        textIcon: "PH",
        website: "https://play.ht"
    },
    inworld: {
        id: "inworld",
        alias: "inworld",
        name: "Inworld",
        icon: "voice_chat",
        color: "#7B2EF2",
        textIcon: "IW",
        website: "https://inworld.ai"
    },
    "aws-polly": {
        id: "aws-polly",
        alias: "polly",
        name: "AWS Polly",
        icon: "record_voice_over",
        color: "#FF9900",
        textIcon: "PL",
        website: "https://aws.amazon.com/polly/",
        authHint: "Use AWS Secret Access Key as API key; set providerSpecificData.accessKeyId and optional region."
    },
    gladia: {
        id: "gladia",
        alias: "gladia",
        name: "Gladia",
        icon: "record_voice_over",
        color: "#6425FE",
        textIcon: "GL",
        website: "https://gladia.io"
    },
    "rev-ai": {
        id: "rev-ai",
        alias: "revai",
        name: "Rev AI",
        icon: "record_voice_over",
        color: "#FF5C35",
        textIcon: "RV",
        website: "https://www.rev.ai"
    },
    speechmatics: {
        id: "speechmatics",
        alias: "sm",
        name: "Speechmatics",
        icon: "record_voice_over",
        color: "#0A2540",
        textIcon: "SM",
        website: "https://www.speechmatics.com",
        hasFree: true,
        freeNote: "Free tier — 8 hours/month, no credit card required. Batch (async) mode only."
    }
};
}),
"[project]/src/shared/constants/providers/upstream-proxy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider catalog data — extracted from providers.ts (god-file decomposition).
 * Pure data literal; re-exported by the providers.ts barrel. No behavior change.
 */ __turbopack_context__.s([
    "UPSTREAM_PROXY_PROVIDERS",
    ()=>UPSTREAM_PROXY_PROVIDERS
]);
const UPSTREAM_PROXY_PROVIDERS = {
    cliproxyapi: {
        id: "cliproxyapi",
        alias: "cpa",
        name: "CLIProxyAPI",
        icon: "proxy",
        color: "#6366F1",
        textIcon: "CPA",
        website: "https://github.com/router-for-me/CLIProxyAPI",
        defaultPort: 8317,
        healthEndpoint: "/v1/models",
        managementPrefix: "/v0/management",
        configDir: "~/.cli-proxy-api",
        binaryName: "cli-proxy-api",
        githubRepo: "router-for-me/CLIProxyAPI"
    },
    "9router": {
        id: "9router",
        alias: "nr",
        name: "9router",
        icon: "router",
        color: "#0EA5E9",
        textIcon: "9R",
        website: "https://www.npmjs.com/package/9router",
        defaultPort: 20130,
        healthEndpoint: "/api/health",
        npmPackage: "9router",
        embedded: true,
        isEmbeddedService: true,
        riskNoticeVariant: "embedded-service"
    }
};
}),
"[project]/src/shared/constants/providers/cloud-agent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider catalog data — extracted from providers.ts (god-file decomposition).
 * Pure data literal; re-exported by the providers.ts barrel. No behavior change.
 */ __turbopack_context__.s([
    "CLOUD_AGENT_PROVIDERS",
    ()=>CLOUD_AGENT_PROVIDERS
]);
const CLOUD_AGENT_PROVIDERS = {
    jules: {
        id: "jules",
        alias: "jules",
        name: "Google Jules",
        icon: "engineering",
        color: "#4285F4",
        textIcon: "JL",
        website: "https://jules.google",
        authHint: "Jules API key for creating and managing cloud coding tasks."
    },
    devin: {
        id: "devin",
        alias: "devin",
        name: "Devin",
        icon: "smart_toy",
        color: "#111827",
        textIcon: "DV",
        website: "https://devin.ai",
        authHint: "Devin API key for cloud agent sessions."
    },
    "codex-cloud": {
        id: "codex-cloud",
        alias: "codex-cloud",
        name: "Codex Cloud",
        icon: "cloud",
        color: "#10A37F",
        textIcon: "CC",
        website: "https://openai.com/codex",
        authHint: "OpenAI API key with Codex Cloud task access."
    }
};
}),
"[project]/src/shared/constants/providers/system.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider catalog data — extracted from providers.ts (god-file decomposition).
 * Pure data literal; re-exported by the providers.ts barrel. No behavior change.
 */ __turbopack_context__.s([
    "SYSTEM_PROVIDERS",
    ()=>SYSTEM_PROVIDERS
]);
const SYSTEM_PROVIDERS = {
    auto: {
        id: "auto",
        alias: "auto",
        name: "Auto (Zero-Config)",
        icon: "auto_awesome",
        color: "#6366F1",
        textIcon: "Auto",
        systemOnly: true,
        description: "Zero-config auto-routing with LKGP across all connected providers"
    }
};
}),
"[project]/src/shared/constants/serviceKinds.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Service kind — declarative tag for what a provider can do beyond basic LLM chat.
 * Affects UI filtering and playground routing; does not influence request routing.
 *
 * This is a dependency-free leaf module to avoid circular imports between
 * providers.ts and providerSchema.ts.
 */ __turbopack_context__.s([
    "SERVICE_KIND_VALUES",
    ()=>SERVICE_KIND_VALUES
]);
const SERVICE_KIND_VALUES = [
    "llm",
    "embedding",
    "image",
    "imageToText",
    "tts",
    "stt",
    "webSearch",
    "webFetch",
    "video",
    "music",
    "ocr"
];
}),
"[project]/src/shared/validation/providerSchema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

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
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$serviceKinds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/serviceKinds.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const ProviderSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    alias: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).optional(),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    icon: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    color: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (#RRGGBB)"),
    textIcon: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    website: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().url().optional(),
    passthroughModels: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    subscriptionRisk: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    riskNoticeVariant: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "oauth",
        "webCookie",
        "deprecated",
        "embedded-service"
    ]).optional(),
    isEmbeddedService: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    deprecated: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    deprecationReason: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    hiddenFromDashboard: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    hasFree: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    freeNote: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    authHint: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    apiHint: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    serviceKinds: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$serviceKinds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SERVICE_KIND_VALUES"])).optional(),
    noAuth: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    anonymousFallback: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    managedAccount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional()
});
const ProvidersMapSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), ProviderSchema);
function validateProviders(map, name) {
    const result = ProvidersMapSchema.safeParse(map);
    if (!result.success) {
        const issues = result.error.issues.map((i)=>`  ${i.path.join(".")}: ${i.message}`).join("\n");
        console.error(`[PROVIDER VALIDATION] ${name} has invalid entries:\n${issues}`);
        throw new Error(`Provider validation failed for ${name}`);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// Re-export service kinds from leaf module (avoids circular dep with providerSchema)
__turbopack_context__.s([
    "AGGREGATOR_PROVIDER_IDS",
    ()=>AGGREGATOR_PROVIDER_IDS,
    "AI_PROVIDERS",
    ()=>AI_PROVIDERS,
    "ALIAS_TO_ID",
    ()=>ALIAS_TO_ID,
    "ANTHROPIC_COMPATIBLE_PREFIX",
    ()=>ANTHROPIC_COMPATIBLE_PREFIX,
    "AUTH_METHODS",
    ()=>AUTH_METHODS,
    "CLAUDE_CODE_COMPATIBLE_PREFIX",
    ()=>CLAUDE_CODE_COMPATIBLE_PREFIX,
    "EMBEDDING_RERANK_PROVIDER_IDS",
    ()=>EMBEDDING_RERANK_PROVIDER_IDS,
    "ENTERPRISE_CLOUD_PROVIDER_IDS",
    ()=>ENTERPRISE_CLOUD_PROVIDER_IDS,
    "FREE_APIKEY_PROVIDER_IDS",
    ()=>FREE_APIKEY_PROVIDER_IDS,
    "FREE_PROVIDERS",
    ()=>FREE_PROVIDERS,
    "IDE_PROVIDER_IDS",
    ()=>IDE_PROVIDER_IDS,
    "ID_TO_ALIAS",
    ()=>ID_TO_ALIAS,
    "IMAGE_ONLY_PROVIDER_IDS",
    ()=>IMAGE_ONLY_PROVIDER_IDS,
    "OPENAI_COMPATIBLE_PREFIX",
    ()=>OPENAI_COMPATIBLE_PREFIX,
    "SELF_HOSTED_CHAT_PROVIDER_IDS",
    ()=>SELF_HOSTED_CHAT_PROVIDER_IDS,
    "USAGE_SUPPORTED_PROVIDERS",
    ()=>USAGE_SUPPORTED_PROVIDERS,
    "VIDEO_PROVIDER_IDS",
    ()=>VIDEO_PROVIDER_IDS,
    "getProviderAlias",
    ()=>getProviderAlias,
    "getProviderByAlias",
    ()=>getProviderByAlias,
    "getProviderById",
    ()=>getProviderById,
    "isAnthropicCompatibleProvider",
    ()=>isAnthropicCompatibleProvider,
    "isClaudeCodeCompatibleProvider",
    ()=>isClaudeCodeCompatibleProvider,
    "isLocalProvider",
    ()=>isLocalProvider,
    "isOpenAICompatibleProvider",
    ()=>isOpenAICompatibleProvider,
    "isSelfHostedChatProvider",
    ()=>isSelfHostedChatProvider,
    "providerAllowsOptionalApiKey",
    ()=>providerAllowsOptionalApiKey,
    "resolveProviderId",
    ()=>resolveProviderId,
    "supportsApiKeyOnFreeProvider",
    ()=>supportsApiKeyOnFreeProvider,
    "supportsBulkApiKey",
    ()=>supportsBulkApiKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/oauth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/web-cookie.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/apikey/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$local$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/local.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/search.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$audio$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/audio.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$upstream$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/upstream-proxy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$cloud$2d$agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/cloud-agent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$system$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/system.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/validation/providerSchema.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const FREE_PROVIDERS = {};
const FREE_APIKEY_PROVIDER_IDS = new Set([
    "qoder",
    "mimocode",
    "opencode",
    "dahl",
    // codebuddy-cn is OAuth-primary but the Tencent gateway also accepts a direct
    // API key (Authorization: Bearer). Admit it through the same managed-provider
    // gate so POST /api/providers accepts the dual-auth shape.
    "codebuddy-cn",
    // auggie is a fully local, credential-less CLI passthrough (auth handled by
    // `auggie login` outside OmniRoute). Admitted here purely so POST /api/providers
    // accepts an optional connection row for display/priority/testStatus tracking —
    // no apiKey is ever required or sent upstream.
    "auggie"
]);
function supportsApiKeyOnFreeProvider(providerId) {
    return typeof providerId === "string" && FREE_APIKEY_PROVIDER_IDS.has(providerId);
}
const IMAGE_ONLY_PROVIDER_IDS = new Set([
    "nanobanana",
    "fal-ai",
    "stability-ai",
    "black-forest-labs",
    "recraft",
    "topaz",
    "segmind",
    "freepik"
]);
const AGGREGATOR_PROVIDER_IDS = new Set([
    "openrouter",
    "synthetic",
    "kilo-gateway",
    "aimlapi",
    "novita",
    "piapi",
    "getgoapi",
    "laozhang",
    "vercel-ai-gateway",
    "unorouter",
    "agentrouter",
    "thebai",
    "fenayai",
    "empower",
    "poe",
    "chutes",
    "hackclub",
    "freetheai",
    "g4f-groq",
    "g4f-gemini",
    "g4f-pollinations",
    "g4f-ollama",
    "g4f-nvidia"
]);
const ENTERPRISE_CLOUD_PROVIDER_IDS = new Set([
    "azure-openai",
    "azure-ai",
    "bedrock",
    "watsonx",
    "oci",
    "sap",
    "vertex",
    "vertex-partner",
    "databricks",
    "datarobot",
    "clarifai",
    "snowflake",
    "heroku",
    "modal"
]);
const VIDEO_PROVIDER_IDS = new Set([
    "runwayml",
    "veoaifree-web",
    "pollinations",
    "minimax",
    "together",
    "replicate",
    "haiper",
    "leonardo",
    "segmind",
    "novita"
]);
const IDE_PROVIDER_IDS = new Set([
    "cursor",
    "zed",
    "trae",
    "raycast"
]);
const EMBEDDING_RERANK_PROVIDER_IDS = new Set([
    "voyage-ai",
    "jina-ai"
]);
const OPENAI_COMPATIBLE_PREFIX = "openai-compatible-";
const ANTHROPIC_COMPATIBLE_PREFIX = "anthropic-compatible-";
const CLAUDE_CODE_COMPATIBLE_PREFIX = "anthropic-compatible-cc-";
function isOpenAICompatibleProvider(providerId) {
    return typeof providerId === "string" && providerId.startsWith(OPENAI_COMPATIBLE_PREFIX);
}
function isAnthropicCompatibleProvider(providerId) {
    return typeof providerId === "string" && providerId.startsWith(ANTHROPIC_COMPATIBLE_PREFIX);
}
function isClaudeCodeCompatibleProvider(providerId) {
    return typeof providerId === "string" && providerId.startsWith(CLAUDE_CODE_COMPATIBLE_PREFIX);
}
function isLocalProvider(providerId) {
    return typeof providerId === "string" && Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$local$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LOCAL_PROVIDERS"], providerId);
}
const SELF_HOSTED_CHAT_PROVIDER_IDS = new Set([
    "ollama-local",
    "lm-studio",
    "vllm",
    "lemonade",
    "llamafile",
    "llama-cpp",
    "triton",
    "docker-model-runner",
    "xinference",
    "oobabooga"
]);
function isSelfHostedChatProvider(providerId) {
    return typeof providerId === "string" && SELF_HOSTED_CHAT_PROVIDER_IDS.has(providerId);
}
// Providers with heterogeneous/no-key auth that don't fit the NOAUTH_PROVIDERS
// registry (e.g. free-tier gateways where a key is accepted but not required).
// Kept as a Set (not an || chain) to keep providerAllowsOptionalApiKey's
// cyclomatic complexity flat as this list grows — see g4f.space (#6650).
const EXPLICIT_OPTIONAL_APIKEY_PROVIDER_IDS = new Set([
    "searxng-search",
    "firecrawl",
    "pollinations",
    "copilot-web",
    "hackclub",
    "g4f-groq",
    "g4f-gemini",
    "g4f-pollinations",
    "g4f-ollama",
    "g4f-nvidia",
    "huggingchat",
    "gitlawb",
    "gitlawb-gmi"
]);
function providerAllowsOptionalApiKey(providerId) {
    return(// ponytail: any noAuth provider auto-qualifies — no per-provider maintenance
    typeof providerId === "string" && providerId in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"] || typeof providerId === "string" && EXPLICIT_OPTIONAL_APIKEY_PROVIDER_IDS.has(providerId) || isLocalProvider(providerId) || isSelfHostedChatProvider(providerId) || isOpenAICompatibleProvider(providerId) || isAnthropicCompatibleProvider(providerId));
}
/**
 * Providers explicitly excluded from bulk API key add — auth is heterogeneous,
 * OAuth-based, multi-field, or requires manual setup per connection.
 */ const BULK_API_KEY_EXCLUDED = new Set([
    "vertex",
    "vertex-partner",
    "ollama-local",
    "grok-web",
    "perplexity-web",
    "blackbox-web",
    "muse-spark-web",
    "deepseek-web",
    "inner-ai",
    "qoder",
    "google-pse-search",
    "command-code",
    "azure"
]);
function supportsBulkApiKey(providerId) {
    if (typeof providerId !== "string" || !providerId) return false;
    if (BULK_API_KEY_EXCLUDED.has(providerId)) return false;
    if (isLocalProvider(providerId)) return false;
    if (isSelfHostedChatProvider(providerId)) return false;
    if (isClaudeCodeCompatibleProvider(providerId)) return false;
    return true;
}
// ── System Providers (virtual, not user-connectable) ──────────────────────────
const _PROVIDER_SECTIONS = [
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OAUTH_PROVIDERS"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$local$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LOCAL_PROVIDERS"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEARCH_PROVIDERS"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$audio$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AUDIO_ONLY_PROVIDERS"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$upstream$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UPSTREAM_PROXY_PROVIDERS"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$cloud$2d$agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLOUD_AGENT_PROVIDERS"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$system$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYSTEM_PROVIDERS"]
];
let _aiProviders = null;
function getOrCreateAiProviders() {
    if (!_aiProviders) {
        _aiProviders = {};
        for (const section of _PROVIDER_SECTIONS){
            Object.assign(_aiProviders, section);
        }
    }
    return _aiProviders;
}
let _ALIAS_TO_ID = null;
function getOrCreateAliasToId() {
    if (!_ALIAS_TO_ID) {
        _ALIAS_TO_ID = {};
        for (const section of _PROVIDER_SECTIONS){
            for (const p of Object.values(section)){
                if (p.alias) _ALIAS_TO_ID[p.alias] = p.id;
            }
        }
    }
    return _ALIAS_TO_ID;
}
let _ID_TO_ALIAS = null;
function getOrCreateIdToAlias() {
    if (!_ID_TO_ALIAS) {
        _ID_TO_ALIAS = {};
        for (const section of _PROVIDER_SECTIONS){
            for (const p of Object.values(section)){
                _ID_TO_ALIAS[p.id] = p.alias || p.id;
            }
        }
    }
    return _ID_TO_ALIAS;
}
function getProviderById(id) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"][id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OAUTH_PROVIDERS"][id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS"][id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"][id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$local$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LOCAL_PROVIDERS"][id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEARCH_PROVIDERS"][id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$audio$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AUDIO_ONLY_PROVIDERS"][id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$upstream$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UPSTREAM_PROXY_PROVIDERS"][id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$cloud$2d$agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLOUD_AGENT_PROVIDERS"][id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$system$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYSTEM_PROVIDERS"][id] ?? undefined;
}
const AI_PROVIDERS = new Proxy({}, {
    get (_, key) {
        if (key === "then") return undefined;
        return typeof key === "string" ? getOrCreateAiProviders()[key] : undefined;
    },
    ownKeys () {
        return Reflect.ownKeys(getOrCreateAiProviders());
    },
    has (_, key) {
        return key in getOrCreateAiProviders();
    },
    getOwnPropertyDescriptor (_, key) {
        const obj = getOrCreateAiProviders();
        if (typeof key === "string" && key in obj) {
            return {
                configurable: true,
                enumerable: true,
                value: obj[key]
            };
        }
        return undefined;
    }
});
const AUTH_METHODS = {
    oauth: {
        id: "oauth",
        name: "OAuth",
        icon: "lock"
    },
    apikey: {
        id: "apikey",
        name: "API Key",
        icon: "key"
    }
};
function getProviderByAlias(alias) {
    for (const section of _PROVIDER_SECTIONS){
        for (const provider of Object.values(section)){
            if (provider.alias === alias || provider.id === alias) {
                return provider;
            }
        }
    }
    return null;
}
function resolveProviderId(aliasOrId) {
    const provider = getProviderByAlias(aliasOrId);
    return provider?.id || aliasOrId;
}
function getProviderAlias(providerId) {
    const provider = getProviderById(providerId);
    return provider?.alias || providerId;
}
const ALIAS_TO_ID = new Proxy({}, {
    get (_, key) {
        return typeof key === "string" ? getOrCreateAliasToId()[key] : undefined;
    },
    ownKeys () {
        return Reflect.ownKeys(getOrCreateAliasToId());
    },
    has (_, key) {
        return key in getOrCreateAliasToId();
    },
    getOwnPropertyDescriptor (_, key) {
        const obj = getOrCreateAliasToId();
        if (typeof key === "string" && key in obj) {
            return {
                configurable: true,
                enumerable: true,
                value: obj[key]
            };
        }
        return undefined;
    }
});
const ID_TO_ALIAS = new Proxy({}, {
    get (_, key) {
        return typeof key === "string" ? getOrCreateIdToAlias()[key] : undefined;
    },
    ownKeys () {
        return Reflect.ownKeys(getOrCreateIdToAlias());
    },
    has (_, key) {
        return key in getOrCreateIdToAlias();
    },
    getOwnPropertyDescriptor (_, key) {
        const obj = getOrCreateIdToAlias();
        if (typeof key === "string" && key in obj) {
            return {
                configurable: true,
                enumerable: true,
                value: obj[key]
            };
        }
        return undefined;
    }
});
const USAGE_SUPPORTED_PROVIDERS = [
    "antigravity",
    "agy",
    "kiro",
    "amazon-q",
    "github",
    "codex",
    "claude",
    "cursor",
    "qoder",
    "kimi-coding",
    "kimi-coding-apikey",
    "glm",
    "glm-cn",
    "zai",
    "glmt",
    "opencode-go",
    "ollama-cloud",
    "minimax",
    "minimax-cn",
    "crof",
    "nanogpt",
    "deepseek",
    "xiaomi-mimo",
    "xiaomi-mimo-token-plan",
    "vertex",
    "vertex-partner",
    "codebuddy-cn",
    // PromptQL playground credits (getCreditSummary → USD micros)
    "promptql",
    "pql",
    // Adobe Firefly web (cookie/JWT as apikey) — GET firefly.adobe.io/v1/credits/balance
    "adobe-firefly",
    "firefly",
    "hyperagent",
    "ha",
    // xAI OAuth (Grok) weekly quota (id + public alias, same pattern as ha/agy)
    "xai-oauth",
    "xao",
    // Grok Build subscription, billing credits, and auto top-up status
    "grok-cli",
    // Firecrawl team credits (GET /v2/team/credit-usage)
    "firecrawl"
];
;
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateProviders"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"], "NOAUTH_PROVIDERS");
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateProviders"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OAUTH_PROVIDERS"], "OAUTH_PROVIDERS");
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateProviders"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS"], "APIKEY_PROVIDERS");
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateProviders"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"], "WEB_COOKIE_PROVIDERS");
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateProviders"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$local$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LOCAL_PROVIDERS"], "LOCAL_PROVIDERS");
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateProviders"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEARCH_PROVIDERS"], "SEARCH_PROVIDERS");
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateProviders"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$audio$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AUDIO_ONLY_PROVIDERS"], "AUDIO_ONLY_PROVIDERS");
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateProviders"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$upstream$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UPSTREAM_PROXY_PROVIDERS"], "UPSTREAM_PROXY_PROVIDERS");
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$providerSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateProviders"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$cloud$2d$agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLOUD_AGENT_PROVIDERS"], "CLOUD_AGENT_PROVIDERS");
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/shared/constants/openRouterPreset.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/shared/constants/upstreamHeaders.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/shared/utils/maskEmail.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/shared/utils/formatting.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-route] (ecmascript)");
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
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskEmail"])(account);
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
}),
"[project]/src/shared/constants/modelCompat.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Model compatibility protocol keys — shared between client UI and server.
 * Must not import Node or DB code so client components can import safely.
 */ /** Client request shapes from detectFormat — compat options apply when the client uses this protocol */ __turbopack_context__.s([
    "MODEL_COMPAT_PROTOCOL_KEYS",
    ()=>MODEL_COMPAT_PROTOCOL_KEYS
]);
const MODEL_COMPAT_PROTOCOL_KEYS = [
    "openai",
    "openai-responses",
    "claude"
];
}),
"[project]/src/shared/utils/globPattern.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared glob → RegExp conversion.
 *
 * Extracted from `src/lib/db/modelComboMappings.ts` (#6540) so client-side
 * code (which cannot import that module — it pulls in `getDbInstance` /
 * server-only DB wiring) can reuse the exact same pattern-matching semantics
 * instead of duplicating the regex-building logic (the repo's ReDoS
 * convention warns against duplicated ad-hoc regex construction).
 */ /**
 * Convert a simple glob pattern to a RegExp.
 * Supports `*` (any characters) and `?` (single character).
 * Case-insensitive matching. Bounded, non-catastrophic-backtracking: all
 * regex specials are escaped before the glob wildcards are substituted, so
 * there is no nested-quantifier construction.
 */ __turbopack_context__.s([
    "globToRegex",
    ()=>globToRegex
]);
function globToRegex(pattern) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&") // escape regex specials
    .replace(/\*/g, ".*") // * → .*
    .replace(/\?/g, "."); // ? → .
    return new RegExp(`^${escaped}$`, "i");
}
}),
"[project]/src/shared/utils/runtimeTimeouts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS,
    "DEFAULT_FETCH_CONNECT_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_CONNECT_TIMEOUT_MS,
    "DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_FETCH_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_TIMEOUT_MS,
    "DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS",
    ()=>DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS,
    "DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_SSE_HEARTBEAT_INTERVAL_MS",
    ()=>DEFAULT_SSE_HEARTBEAT_INTERVAL_MS,
    "DEFAULT_STREAM_IDLE_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_IDLE_TIMEOUT_MS,
    "DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS,
    "DEFAULT_STREAM_READINESS_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_READINESS_TIMEOUT_MS,
    "MAX_TIMER_TIMEOUT_MS",
    ()=>MAX_TIMER_TIMEOUT_MS,
    "getApiBridgeTimeoutConfig",
    ()=>getApiBridgeTimeoutConfig,
    "getMainServerTimeoutConfig",
    ()=>getMainServerTimeoutConfig,
    "getStainlessTimeoutSeconds",
    ()=>getStainlessTimeoutSeconds,
    "getTlsClientTimeoutConfig",
    ()=>getTlsClientTimeoutConfig,
    "getUpstreamTimeoutConfig",
    ()=>getUpstreamTimeoutConfig
]);
const DEFAULT_FETCH_TIMEOUT_MS = 600_000;
const DEFAULT_STREAM_IDLE_TIMEOUT_MS = 600_000;
const MAX_TIMER_TIMEOUT_MS = 2_147_483_647;
const DEFAULT_SSE_HEARTBEAT_INTERVAL_MS = 15_000;
const DEFAULT_STREAM_READINESS_TIMEOUT_MS = 80_000;
const DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS = 180_000;
const DEFAULT_FETCH_CONNECT_TIMEOUT_MS = 30_000;
const DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS = 4_000;
const DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS = 600_000;
const DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS = 300_000;
const DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS = 60_000;
const DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS = 5_000;
const DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS = 0;
const DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS = 65_000;
const DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS = 66_000;
function hasEnvValue(env, name) {
    const raw = env[name];
    return raw != null && raw.trim() !== "";
}
function readTimeoutMs(env, name, defaultValue, options = {}) {
    const raw = env[name];
    if (raw == null || raw.trim() === "") return defaultValue;
    const parsed = Number(raw);
    const isValid = Number.isFinite(parsed) && (options.allowZero ? parsed >= 0 : parsed > 0);
    if (!isValid) {
        options.logger?.(`Invalid ${name}="${raw}". Using default ${defaultValue}ms.`);
        return defaultValue;
    }
    return Math.floor(parsed);
}
function getUpstreamTimeoutConfig(env = process.env, logger) {
    const sharedRequestTimeoutMs = hasEnvValue(env, "REQUEST_TIMEOUT_MS") ? readTimeoutMs(env, "REQUEST_TIMEOUT_MS", DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    }) : undefined;
    const fetchTimeoutMs = readTimeoutMs(env, "FETCH_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamIdleTimeoutMs = readTimeoutMs(env, "STREAM_IDLE_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_STREAM_IDLE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamReadinessTimeoutMs = readTimeoutMs(env, "STREAM_READINESS_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_STREAM_READINESS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamReadinessMaxTimeoutMs = readTimeoutMs(env, "STREAM_READINESS_MAX_TIMEOUT_MS", DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const sseHeartbeatIntervalMs = readTimeoutMs(env, "SSE_HEARTBEAT_INTERVAL_MS", DEFAULT_SSE_HEARTBEAT_INTERVAL_MS, {
        allowZero: true,
        logger
    });
    return {
        fetchTimeoutMs,
        streamIdleTimeoutMs,
        streamReadinessTimeoutMs,
        streamReadinessMaxTimeoutMs,
        sseHeartbeatIntervalMs,
        fetchHeadersTimeoutMs: readTimeoutMs(env, "FETCH_HEADERS_TIMEOUT_MS", fetchTimeoutMs, {
            allowZero: true,
            logger
        }),
        fetchBodyTimeoutMs: readTimeoutMs(env, "FETCH_BODY_TIMEOUT_MS", fetchTimeoutMs, {
            allowZero: true,
            logger
        }),
        fetchConnectTimeoutMs: readTimeoutMs(env, "FETCH_CONNECT_TIMEOUT_MS", DEFAULT_FETCH_CONNECT_TIMEOUT_MS, {
            allowZero: true,
            logger
        }),
        fetchKeepAliveTimeoutMs: readTimeoutMs(env, "FETCH_KEEPALIVE_TIMEOUT_MS", DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS, {
            logger
        })
    };
}
function getStainlessTimeoutSeconds(env = process.env, logger) {
    const { fetchTimeoutMs } = getUpstreamTimeoutConfig(env, logger);
    return Math.max(1, Math.ceil(fetchTimeoutMs / 1_000));
}
function getTlsClientTimeoutConfig(env = process.env, logger) {
    const upstream = getUpstreamTimeoutConfig(env, logger);
    return {
        timeoutMs: readTimeoutMs(env, "TLS_CLIENT_TIMEOUT_MS", upstream.fetchTimeoutMs, {
            allowZero: true,
            logger
        })
    };
}
function getApiBridgeTimeoutConfig(env = process.env, logger) {
    const sharedRequestTimeoutMs = hasEnvValue(env, "REQUEST_TIMEOUT_MS") ? readTimeoutMs(env, "REQUEST_TIMEOUT_MS", DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    }) : undefined;
    const proxyTimeoutMs = readTimeoutMs(env, "API_BRIDGE_PROXY_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const derivedRequestTimeoutMs = proxyTimeoutMs > 0 ? Math.max(proxyTimeoutMs, DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS) : DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS;
    const serverRequestDefaultMs = sharedRequestTimeoutMs !== undefined ? sharedRequestTimeoutMs > 0 ? Math.max(sharedRequestTimeoutMs, derivedRequestTimeoutMs) : 0 : derivedRequestTimeoutMs;
    const serverKeepAliveTimeoutMs = readTimeoutMs(env, "API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const serverHeadersTimeoutMs = readTimeoutMs(env, "API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    return {
        proxyTimeoutMs,
        serverRequestTimeoutMs: readTimeoutMs(env, "API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS", serverRequestDefaultMs, {
            allowZero: true,
            logger
        }),
        serverHeadersTimeoutMs: serverHeadersTimeoutMs > 0 && serverKeepAliveTimeoutMs > 0 ? Math.max(serverHeadersTimeoutMs, serverKeepAliveTimeoutMs + 1_000) : serverHeadersTimeoutMs,
        serverKeepAliveTimeoutMs,
        serverSocketTimeoutMs: readTimeoutMs(env, "API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS, {
            allowZero: true,
            logger
        })
    };
}
function getMainServerTimeoutConfig(env = process.env, logger) {
    const keepAliveTimeoutMs = readTimeoutMs(env, "MAIN_SERVER_KEEPALIVE_TIMEOUT_MS", DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const headersTimeoutMs = readTimeoutMs(env, "MAIN_SERVER_HEADERS_TIMEOUT_MS", DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    return {
        keepAliveTimeoutMs,
        // Node requires headersTimeout > keepAliveTimeout to avoid its internal
        // race-condition warning; keep both configurable but always coherent.
        headersTimeoutMs: headersTimeoutMs > 0 && keepAliveTimeoutMs > 0 ? Math.max(headersTimeoutMs, keepAliveTimeoutMs + 1_000) : headersTimeoutMs
    };
}
}),
"[project]/src/shared/constants/batch.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_BATCH_EXPIRATION_SECONDS",
    ()=>DEFAULT_BATCH_EXPIRATION_SECONDS
]);
const DEFAULT_BATCH_EXPIRATION_SECONDS = 30 * 24 * 60 * 60;
}),
"[project]/src/shared/utils/grokBilling.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GROK_BUILD_ADDITIONAL_CREDITS_URL",
    ()=>GROK_BUILD_ADDITIONAL_CREDITS_URL,
    "buildGrokBillingCardRows",
    ()=>buildGrokBillingCardRows,
    "formatGrokMinorUnits",
    ()=>formatGrokMinorUnits,
    "sanitizeGrokBillingStatus",
    ()=>sanitizeGrokBillingStatus
]);
const GROK_BUILD_ADDITIONAL_CREDITS_URL = "https://grok.com/build?_s=usage";
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function minorUnits(value) {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}
function sanitizeGrokBillingStatus(value) {
    const billing = toRecord(value);
    if (!billing || billing.currency !== "USD") return undefined;
    if (billing.additionalCreditsUrl !== GROK_BUILD_ADDITIONAL_CREDITS_URL) return undefined;
    const rawAutoTopUp = toRecord(billing.autoTopUp);
    if (!rawAutoTopUp || typeof rawAutoTopUp.available !== "boolean") return undefined;
    const available = rawAutoTopUp.available;
    const enabled = available && typeof rawAutoTopUp.enabled === "boolean" ? rawAutoTopUp.enabled : undefined;
    const extraCreditsMinorUnits = minorUnits(billing.extraCreditsMinorUnits);
    const thresholdMinorUnits = enabled === true ? minorUnits(rawAutoTopUp.thresholdMinorUnits) : undefined;
    const amountMinorUnits = enabled === true ? minorUnits(rawAutoTopUp.amountMinorUnits) : undefined;
    const maxMonthlyMinorUnits = enabled === true ? minorUnits(rawAutoTopUp.maxMonthlyMinorUnits) : undefined;
    return {
        currency: "USD",
        ...extraCreditsMinorUnits !== undefined ? {
            extraCreditsMinorUnits
        } : {},
        autoTopUp: {
            available,
            ...enabled !== undefined ? {
                enabled
            } : {},
            ...thresholdMinorUnits !== undefined ? {
                thresholdMinorUnits
            } : {},
            ...amountMinorUnits !== undefined ? {
                amountMinorUnits
            } : {},
            ...maxMonthlyMinorUnits !== undefined ? {
                maxMonthlyMinorUnits
            } : {}
        },
        additionalCreditsUrl: GROK_BUILD_ADDITIONAL_CREDITS_URL
    };
}
function formatGrokMinorUnits(value, currency, locales) {
    if (value === undefined) return null;
    return new Intl.NumberFormat(locales, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}
const fallbackTranslation = (_key, fallback)=>fallback;
function buildGrokBillingCardRows(billing, locales, translate = fallbackTranslation) {
    const rows = [];
    const extraCredits = formatGrokMinorUnits(billing.extraCreditsMinorUnits, billing.currency, locales);
    if (extraCredits !== null) {
        rows.push({
            kind: "balance",
            label: translate("grokExtraUsageCredits", "Extra Usage Credits"),
            value: extraCredits
        });
    }
    const autoTopUp = billing.autoTopUp;
    let autoTopUpValue;
    if (!autoTopUp.available) {
        autoTopUpValue = translate("grokAutoTopUpUnavailable", "Unavailable");
    } else if (!autoTopUp.enabled) {
        autoTopUpValue = translate("grokAutoTopUpDisabled", "Disabled");
    } else {
        const threshold = formatGrokMinorUnits(autoTopUp.thresholdMinorUnits, billing.currency, locales);
        const amount = formatGrokMinorUnits(autoTopUp.amountMinorUnits, billing.currency, locales);
        const maximum = formatGrokMinorUnits(autoTopUp.maxMonthlyMinorUnits, billing.currency, locales);
        autoTopUpValue = [
            translate("grokAutoTopUpEnabled", "Enabled"),
            threshold ? `${translate("grokAutoTopUpAt", "at")} ${threshold}` : null,
            amount ? `${translate("grokAutoTopUpAdd", "add")} ${amount}` : null,
            maximum ? `${translate("grokAutoTopUpMax", "max")} ${maximum}/${translate("grokAutoTopUpMonth", "month")}` : null
        ].filter((part)=>part !== null).join(" · ");
    }
    rows.push({
        kind: "status",
        label: translate("grokAutoTopUp", "Auto Top-Up"),
        value: autoTopUpValue
    });
    rows.push({
        kind: "link",
        label: translate("grokAdditionalCredits", "Additional Credits"),
        href: billing.additionalCreditsUrl,
        target: "_blank",
        rel: "noreferrer noopener"
    });
    return rows;
}
}),
"[project]/src/shared/constants/publicApiRoutes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PUBLIC_API_ROUTE_PREFIXES",
    ()=>PUBLIC_API_ROUTE_PREFIXES,
    "PUBLIC_READONLY_API_ROUTE_PREFIXES",
    ()=>PUBLIC_READONLY_API_ROUTE_PREFIXES,
    "PUBLIC_READONLY_METHODS",
    ()=>PUBLIC_READONLY_METHODS,
    "isPublicApiRoute",
    ()=>isPublicApiRoute
]);
const PUBLIC_API_ROUTE_PREFIXES = [
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/status",
    "/api/auth/oidc/",
    "/api/init",
    "/api/v1/",
    "/api/sync/bundle",
    "/api/oauth/",
    // Public, ticket-gated Codex device-flow completion (validate + persist).
    // The handler enforces its own single-use ticket check; no dashboard auth.
    "/api/codex/connect/",
    // Remote-mode bootstrap: exchange the management password for a scoped CLI
    // access token. The handler enforces its own password check + lockout — there
    // is no token yet at this point, so it cannot require management auth.
    "/api/cli/connect",
    // Terminal-friendly @@om-usage equivalent for CLI clients (Claude Code/Codex).
    // The handler enforces its own auth via extractUsageCommandApiKey/isValidApiKey
    // and the allowUsageCommand flag — it must not be gated by management auth.
    "/api/usage/om-usage",
    // Chaos Mode external dispatch endpoint (POST /api/skills/collect/chaos).
    // This entry only bypasses the dashboard requireLogin (cookie) gate — the
    // handler enforces its own Bearer-token auth (validateApiKey +
    // chaosModeEnabled check) before doing any work. See src/app/api/skills/
    // collect/chaos/route.ts. Do not widen this prefix to cover other
    // /api/skills/collect/* routes without the same per-handler auth.
    "/api/skills/collect/chaos"
];
const PUBLIC_READONLY_API_ROUTE_PREFIXES = [
    "/api/health/ping",
    "/api/monitoring/health",
    "/api/settings/require-login"
];
const PUBLIC_READONLY_METHODS = new Set([
    "GET",
    "HEAD",
    "OPTIONS"
]);
const PUBLIC_CLOUD_API_ROUTES = [
    {
        path: "/api/cloud/auth",
        methods: new Set([
            "POST",
            "OPTIONS"
        ])
    },
    {
        path: "/api/cloud/model/resolve",
        methods: new Set([
            "POST",
            "OPTIONS"
        ])
    },
    {
        path: "/api/cloud/models/alias",
        methods: new Set([
            "GET",
            "HEAD",
            "OPTIONS"
        ])
    }
];
function pathMatchesExactRoute(pathname, routePath) {
    return pathname === routePath || pathname === `${routePath}/`;
}
function isPublicCloudApiRoute(pathname, method) {
    const normalizedMethod = String(method).toUpperCase();
    return PUBLIC_CLOUD_API_ROUTES.some(({ path, methods })=>pathMatchesExactRoute(pathname, path) && methods.has(normalizedMethod));
}
function isPublicApiRoute(pathname, method = "GET") {
    if (isPublicCloudApiRoute(pathname, method)) {
        return true;
    }
    if (PUBLIC_API_ROUTE_PREFIXES.some((route)=>pathname.startsWith(route))) {
        return true;
    }
    if (!PUBLIC_READONLY_METHODS.has(String(method).toUpperCase())) {
        return false;
    }
    return PUBLIC_READONLY_API_ROUTE_PREFIXES.some((route)=>pathname.startsWith(route));
}
;
}),
"[project]/src/shared/constants/antigravityClientProfile.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANTIGRAVITY_CLIENT_PROFILE_OPTIONS",
    ()=>ANTIGRAVITY_CLIENT_PROFILE_OPTIONS,
    "ANTIGRAVITY_CLIENT_PROFILE_VALUES",
    ()=>ANTIGRAVITY_CLIENT_PROFILE_VALUES,
    "DEFAULT_ANTIGRAVITY_CLIENT_PROFILE",
    ()=>DEFAULT_ANTIGRAVITY_CLIENT_PROFILE,
    "normalizeAntigravityClientProfile",
    ()=>normalizeAntigravityClientProfile,
    "normalizeAntigravityClientProfileSetting",
    ()=>normalizeAntigravityClientProfileSetting
]);
const ANTIGRAVITY_CLIENT_PROFILE_VALUES = [
    "ide",
    "cli"
];
const DEFAULT_ANTIGRAVITY_CLIENT_PROFILE = "ide";
const ANTIGRAVITY_CLIENT_PROFILE_OPTIONS = [
    {
        value: "ide",
        labelKey: "antigravityClientProfileIde"
    },
    {
        value: "cli",
        labelKey: "antigravityClientProfileCli"
    }
];
function normalizeAntigravityClientProfile(value) {
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "ide" || normalized === "cli") {
            return normalized;
        }
        // Read-only compatibility for values persisted before the official CLI profile
        // replaced OmniRoute's synthetic harness/sdk naming. New writes are validated
        // against ANTIGRAVITY_CLIENT_PROFILE_VALUES and cannot reintroduce these aliases.
        if (normalized === "harness" || normalized === "sdk") {
            return "cli";
        }
    }
    return DEFAULT_ANTIGRAVITY_CLIENT_PROFILE;
}
const normalizeAntigravityClientProfileSetting = normalizeAntigravityClientProfile;
}),
"[project]/src/shared/constants/modelSpecs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized specifications for AI Models.
 * Contains maximum token caps and thinking budgets to prevent API errors
 * when clients request more than the model supports.
 */ __turbopack_context__.s([
    "MODEL_SPECS",
    ()=>MODEL_SPECS,
    "capMaxOutputTokens",
    ()=>capMaxOutputTokens,
    "capThinkingBudget",
    ()=>capThinkingBudget,
    "findModelSpecIdByExactOrAlias",
    ()=>findModelSpecIdByExactOrAlias,
    "getAuthoritativeContextWindow",
    ()=>getAuthoritativeContextWindow,
    "getAuthoritativeProviderContextWindow",
    ()=>getAuthoritativeProviderContextWindow,
    "getCanonicalModelSpecId",
    ()=>getCanonicalModelSpecId,
    "getDefaultThinkingBudget",
    ()=>getDefaultThinkingBudget,
    "getMaxEffortWhenThinkingDisabled",
    ()=>getMaxEffortWhenThinkingDisabled,
    "getModelSpec",
    ()=>getModelSpec,
    "isAdaptiveThinkingOnly",
    ()=>isAdaptiveThinkingOnly,
    "normalizeThinkingForModel",
    ()=>normalizeThinkingForModel,
    "resolveModelAlias",
    ()=>resolveModelAlias
]);
const BEDROCK_CLAUDE_ALIASES = (...modelIds)=>[
        ...new Set(modelIds.flatMap((modelId)=>[
                modelId,
                `anthropic.${modelId}`,
                `eu.anthropic.${modelId}`,
                `us.anthropic.${modelId}`,
                `global.anthropic.${modelId}`,
                `bedrock/anthropic.${modelId}`,
                `bedrock/eu.anthropic.${modelId}`,
                `bedrock/us.anthropic.${modelId}`,
                `bedrock/global.anthropic.${modelId}`
            ]))
    ];
// Provider discovery/sync sources can under-report GLM-5.2 IDs as 128K.
// Keep native/bare Z.AI GLM-5.2 context authoritative, but do not blindly apply
// it to every provider-wrapped alias: hosted providers can and do cap lower.
const AUTHORITATIVE_CONTEXT_WINDOW_MODEL_IDS = new Set([
    "glm-5.2",
    "glm-5.2-high",
    "glm-5.2-max"
]);
const AUTHORITATIVE_PROVIDER_CONTEXT_WINDOWS = new Map([
    [
        "cloudflare-ai/@cf/zai-org/glm-5.2",
        262144
    ],
    // Hugging Face Router has 1M-capable backends, but bare routing can select
    // lower-context providers (notably Together at 262K), so advertise a safe floor
    // unless the caller can pin a 1M-capable backend.
    [
        "huggingface/zai-org/glm-5.2",
        262144
    ],
    [
        "opencode/glm-5.2",
        1000000
    ],
    [
        "opencode-zen/glm-5.2",
        1000000
    ],
    [
        "opencode-go/glm-5.2",
        1000000
    ],
    [
        "zenmux/z-ai/glm-5.2",
        1000000
    ],
    [
        "zenmux/z-ai/glm-5.2-free",
        1000000
    ]
]);
const GPT_5_6_MODEL_SPEC = {
    maxOutputTokens: 128000,
    contextWindow: 1050000,
    // Reserve 32K for visible response: thinking + response must both fit
    // under maxOutputTokens. A cap equal to maxOutputTokens leaves zero room
    // for the actual response when thinking consumes the full budget.
    thinkingBudgetCap: 96000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true
};
const GEMINI_35_FLASH_MODEL_SPEC = {
    maxOutputTokens: 65536,
    contextWindow: 1048576,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true
};
const MODEL_SPECS = {
    "gpt-5.6": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6"
        ]
    },
    "gpt-5.6-sol": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6-sol"
        ]
    },
    "gpt-5.6-terra": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6-terra"
        ]
    },
    "gpt-5.6-luna": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6-luna"
        ]
    },
    "gpt-5.5": {
        maxOutputTokens: 128000,
        contextWindow: 1050000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    "gpt-5.4": {
        maxOutputTokens: 131072,
        contextWindow: 409600,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "openai/gpt-5.4"
        ]
    },
    // ── GPT-4o family ──────────────────────────────────────────────
    "gpt-4o-mini": {
        maxOutputTokens: 16384,
        contextWindow: 128000,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "openai/gpt-4o-mini"
        ]
    },
    "gpt-4o": {
        maxOutputTokens: 16384,
        contextWindow: 128000,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "openai/gpt-4o"
        ]
    },
    // ── Gemini 2.5 and 3.5 Flash series ──────────────────────────────
    "gemini-2.5-flash": {
        maxOutputTokens: 65536,
        contextWindow: 1048576,
        // #3842: real Google max thinking budget for 2.5-flash is 24576; declaring the
        // cap makes capThinkingBudget() actually clamp instead of passing values through.
        thinkingBudgetCap: 24576,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true
    },
    "gemini-3.5-flash-extra-low": {
        ...GEMINI_35_FLASH_MODEL_SPEC,
        thinkingBudgetCap: 0
    },
    "gemini-3.5-flash-low": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    "gemini-3-flash-agent": {
        ...GEMINI_35_FLASH_MODEL_SPEC,
        thinkingBudgetCap: 0
    },
    // ── Gemini 3.6 Flash (Antigravity live tiers) ───────────────────
    // The model id itself selects the upstream 10k/4k/1k reasoning tier. Antigravity
    // still rejects client-supplied thinking parameters, so keep the explicit-parameter
    // capability aligned with the existing Gemini 3.5 tier ids.
    "gemini-3.6-flash-high": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    "gemini-3.6-flash-medium": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    "gemini-3.6-flash-low": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    // ── Gemini 3 Flash series ───────────────────────────────────────
    "gemini-3-flash": {
        maxOutputTokens: 65536,
        contextWindow: 1048576,
        defaultThinkingBudget: 0,
        thinkingBudgetCap: 0,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "gemini-3-flash-preview",
            "gemini-3.1-flash-lite-preview"
        ]
    },
    // ── Gemini 3.1 Pro ───────────────────────────────────────────────
    "gemini-3.1-pro": {
        maxOutputTokens: 65535,
        contextWindow: 1048576,
        defaultThinkingBudget: 24576,
        thinkingBudgetCap: 32768,
        thinkingOverhead: 1000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "gemini-pro-agent",
            "gemini-3.1-pro-high",
            "gemini-3-pro-high",
            "gemini-3-pro-preview",
            "gemini-3.1-pro-preview",
            "gemini-3.1-pro-preview-customtools"
        ]
    },
    // ── Gemini 3.1 Pro Low (deprecated, kept for back-compat) ────────
    "gemini-3.1-pro-low": {
        maxOutputTokens: 65535,
        contextWindow: 1048576,
        defaultThinkingBudget: 8192,
        thinkingBudgetCap: 16000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "gemini-3-pro-low"
        ]
    },
    // ── Gemini 3.5 Flash ─────────────────────────────────────────────
    "gemini-3.5-flash": {
        ...GEMINI_35_FLASH_MODEL_SPEC,
        aliases: [
            "gemini-3.5-flash-high"
        ]
    },
    // ── Claude Opus 4.5 ─────────────────────────────────────────────
    "claude-opus-4-5": {
        maxOutputTokens: 32768,
        contextWindow: 200000,
        defaultThinkingBudget: 10000,
        thinkingBudgetCap: 32000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    // ── Claude Sonnet 4.5 ───────────────────────────────────────────
    "claude-sonnet-4-5": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-sonnet-4-5", "claude-sonnet-4-5-20250929")
    },
    // ── Claude Opus 4.5 (full ID — overrides prefix match on claude-opus-4-5) ──
    "claude-opus-4-5-20251101": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        defaultThinkingBudget: 10000,
        thinkingBudgetCap: 32000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    // ── Claude Sonnet 4.6 ───────────────────────────────────────────
    "claude-sonnet-4-6": {
        maxOutputTokens: 64000,
        contextWindow: 1000000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-sonnet-4-6", "claude-sonnet-4.6")
    },
    // ── Claude Sonnet 5 ─────────────────────────────────────────────
    "claude-sonnet-5": {
        // 1M context, 128K max output. Adaptive-thinking-only (manual
        // budget_tokens / thinking.type:"enabled" return 400; effort-steered);
        // unlike Fable 5 it still accepts thinking.type:"disabled".
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-sonnet-5")
    },
    // ── Claude Opus 4.6 ─────────────────────────────────────────────
    "claude-opus-4-6": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        // Anthropic accepts thinking.budget_tokens in [1024, 128000]; cap
        // a bit below to leave headroom for the visible response within
        // max_tokens (thinking + response must both fit under max_tokens).
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-4-6", "claude-opus-4.6")
    },
    // ── Claude Opus 4.7 ─────────────────────────────────────────────
    "claude-opus-4-7": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        // Opus 4.7 removed manual extended thinking: a fixed `thinking.budget_tokens`
        // (or `thinking.type:"enabled"`) returns 400. Reasoning is adaptive-only and
        // steered by `output_config.effort`. defaultThinkingBudget/thinkingBudgetCap
        // are retained only as caps for any legacy budget path; the request flow
        // collapses manual thinking to adaptive before dispatch (see adaptiveThinkingOnly).
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-4-7", "claude-opus-4.7")
    },
    // ── Claude Fable 5 ──────────────────────────────────────────────
    "claude-fable-5": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        // Fable 5 defaults to adaptive thinking and rejects `thinking.type:"disabled"` (#3554).
        rejectsThinkingDisabled: true,
        // …and, like Opus 4.7+, rejects manual budgets/`type:"enabled"` (adaptive-only).
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-fable-5")
    },
    // ── Claude Opus 5 ───────────────────────────────────────────────
    "claude-opus-5": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        maxEffortWhenThinkingDisabled: "high",
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-5")
    },
    // ── Claude Opus 4.8 ─────────────────────────────────────────────
    "claude-opus-4-8": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        // Opus 4.8 inherits Opus 4.7's adaptive thinking constraints: no fixed
        // thinking budget requests, with effort controlled by output_config.
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-4-8", "claude-opus-4.8", "claude-opus-4.8-fast")
    },
    // ── Claude Sonnet 4.5 ───────────────────────────────────────────
    "claude-sonnet-4-5-20250929": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "claude-sonnet-4.5"
        ]
    },
    // ── Claude Haiku 4.5 ────────────────────────────────────────────
    "claude-haiku-4-5-20251001": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "claude-haiku-4.5"
        ]
    },
    // ── Kimi K3 (Moonshot API — 1M context/output, native vision) ────
    // `k3` is the Kimi Coding / kimi-coding-apikey wire id (#8250).
    "kimi-k3": {
        maxOutputTokens: 1048576,
        contextWindow: 1048576,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "k3"
        ]
    },
    // ── Kimi K2.6 (Moonshot API — 262K native) ──────────────────────
    "kimi-k2.6": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "kimi-k2.6-thinking"
        ]
    },
    // ── Kimi K2.7 Code (Moonshot — 262K native, parity with K2.6) ───
    // #3761: importing this via Ollama Cloud's sparse /v1/models gave it no caps, so it
    // fell back to the 128K/8K defaults and lost vision/thinking. Pin the real values.
    "kimi-k2.7-code": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "kimi-k2.7",
            "kimi-k2.7-code-thinking",
            "kimi-k2.7-code-highspeed"
        ]
    },
    // ── Kimi K2.5 (Moonshot — 262K native, parity with K2.6) ────────
    "kimi-k2.5": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "kimi-k2.5-thinking"
        ]
    },
    // ── Qwen3.x Plus / Max (Bailian — multimodal text/image/video, 1M context) ─
    "qwen3-max": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "qwen3.7-max",
            "qwen3-max-2026-01-23"
        ]
    },
    "qwen3.8-max-preview": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    "qwen3.6-plus": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    "qwen3.5-plus": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    // ── Xiaomi MiMo V2.5 (1M context, consensus across 7+ sync sources) ──
    // Vision: ONLY mimo-v2.5 and mimo-v2-omni accept images per Xiaomi's docs
    // (mimo.mi.com .../image-understanding). The *-pro chat models are TEXT-ONLY;
    // models.dev mislabels them (hermes-agent#18884) — a hard override in
    // src/lib/modelCapabilities.ts also beats that wrong synced attachment.
    "mimo-v2.5-pro": {
        maxOutputTokens: 131072,
        contextWindow: 1048576,
        supportsTools: true,
        supportsVision: false
    },
    "mimo-v2.5": {
        maxOutputTokens: 131072,
        contextWindow: 1048576,
        supportsTools: true,
        supportsVision: true
    },
    "mimo-v2-pro": {
        maxOutputTokens: 131072,
        contextWindow: 262144,
        supportsTools: true,
        supportsVision: false
    },
    "mimo-v2-omni": {
        maxOutputTokens: 131072,
        contextWindow: 262144,
        supportsTools: true,
        supportsVision: true
    },
    "mimo-v2-flash": {
        maxOutputTokens: 65536,
        contextWindow: 262144,
        supportsTools: true
    },
    // ── Z.AI GLM-5.2 (1M context, 128K max output, effort tiers) ────
    "glm-5.2": {
        maxOutputTokens: 131072,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    "glm-5.2-high": {
        maxOutputTokens: 131072,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    "glm-5.2-max": {
        maxOutputTokens: 131072,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    // ── Z.AI GLM-5.x (200K context, 128K max output) ─────────────────
    "glm-5.1": {
        maxOutputTokens: 128000,
        contextWindow: 200000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    "glm-5": {
        maxOutputTokens: 128000,
        contextWindow: 200000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    // ── MiniMax M3 (1M context, 512K max output) ─────────────────────
    // max output verified against MiniMax docs / OpenRouter / Artificial
    // Analysis (Nov 2025 launch): 1,048,576-token context, up to 512K output.
    "minimax-m3": {
        maxOutputTokens: 512000,
        contextWindow: 1048576,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        aliases: [
            "MiniMax-M3",
            "MiniMaxAI/MiniMax-M3"
        ]
    },
    // ── MiniMax M2.x (200K context family) ───────────────────────────
    "minimax-m2.7": {
        maxOutputTokens: 131072,
        contextWindow: 204800,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        aliases: [
            "MiniMax-M2.7",
            "MiniMaxAI/MiniMax-M2.7"
        ]
    },
    "minimax-m2.5": {
        maxOutputTokens: 131072,
        contextWindow: 200000,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        aliases: [
            "MiniMax-M2.5"
        ]
    },
    // ── DeepSeek V4 (1M context, 384K max output) ────────────────────
    "deepseek-v4-pro": {
        maxOutputTokens: 384000,
        contextWindow: 1000000,
        // Reserve 4K for visible response: thinking + response must both fit
        // under maxOutputTokens. A cap equal to maxOutputTokens leaves zero room
        // for the actual response when thinking consumes the full budget.
        thinkingBudgetCap: 380000,
        supportsThinking: true,
        supportsTools: true
    },
    "deepseek-v4-flash": {
        maxOutputTokens: 384000,
        contextWindow: 1000000,
        thinkingBudgetCap: 380000,
        supportsThinking: true,
        supportsTools: true
    },
    // ── Tencent Hunyuan 3 Preview ────────────────────────────────────
    "hy3-preview": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true
    },
    // Defaults
    __default__: {}
};
// #8697-adjacent: getCanonicalModelSpecId() re-scanned Object.keys/entries(MODEL_SPECS)
// up to 3 times per call (exact ci, alias ci, prefix) — the top hotspot in a full
// catalog-rebuild profile once the pricing-path bottlenecks were fixed. MODEL_SPECS is
// a static module constant (never mutated at runtime), so the lowercase index below is
// built once, lazily, on first use and never invalidated. Iteration order for the
// prefix-match candidates is preserved exactly (same Object.keys() insertion order) so
// resolution outcomes for ambiguous prefixes are unchanged.
let modelSpecIndex = null;
function getModelSpecIndex() {
    if (modelSpecIndex) return modelSpecIndex;
    const exactCi = new Map();
    const aliasCi = new Map();
    const aliasExact = new Map();
    const prefixCandidates = [];
    for (const [canonical, spec] of Object.entries(MODEL_SPECS)){
        const lowerCanonical = canonical.toLowerCase();
        if (!exactCi.has(lowerCanonical)) exactCi.set(lowerCanonical, canonical);
        for (const alias of spec.aliases || []){
            const lowerAlias = alias.toLowerCase();
            if (!aliasCi.has(lowerAlias)) aliasCi.set(lowerAlias, canonical);
            if (!aliasExact.has(alias)) aliasExact.set(alias, canonical);
        }
        if (canonical !== "__default__") prefixCandidates.push([
            lowerCanonical,
            canonical
        ]);
    }
    modelSpecIndex = {
        exactCi,
        aliasCi,
        aliasExact,
        prefixCandidates
    };
    return modelSpecIndex;
}
function findModelSpecIdByExactOrAlias(modelId) {
    const lower = modelId.toLowerCase();
    const index = getModelSpecIndex();
    const exactHit = index.exactCi.get(lower);
    if (exactHit && exactHit !== "__default__") return exactHit;
    const aliasHit = index.aliasCi.get(lower);
    if (aliasHit && aliasHit !== "__default__") return aliasHit;
    return null;
}
function getCanonicalModelSpecId(modelId) {
    if (MODEL_SPECS[modelId]) return modelId;
    // Case-insensitive lookups: upstream model ids are often capitalized
    // (e.g. "MiniMax-M2.7") while specs/aliases use lowercase ids (#3141).
    const lower = modelId.toLowerCase();
    const index = getModelSpecIndex();
    // Exact match (case-insensitive)
    const exactHit = index.exactCi.get(lower);
    if (exactHit) return exactHit;
    // Buscas por alias (case-insensitive)
    const aliasHit = index.aliasCi.get(lower);
    if (aliasHit) return aliasHit;
    // Prefix matching (case-insensitive) — same insertion-order iteration as before,
    // first match wins.
    for (const [lowerKey, canonical] of index.prefixCandidates){
        if (lower.startsWith(lowerKey)) return canonical;
    }
    return null;
}
function getModelSpec(modelId) {
    const canonical = getCanonicalModelSpecId(modelId);
    return canonical ? MODEL_SPECS[canonical] : undefined;
}
function getAuthoritativeContextWindow(modelId) {
    if (typeof modelId !== "string" || modelId.length === 0) return null;
    const normalized = modelId.toLowerCase();
    for (const canonical of AUTHORITATIVE_CONTEXT_WINDOW_MODEL_IDS){
        if (canonical.toLowerCase() === normalized) return MODEL_SPECS[canonical]?.contextWindow ?? null;
    }
    return null;
}
function getAuthoritativeProviderContextWindow(provider, modelId) {
    if (typeof provider !== "string" || typeof modelId !== "string") return null;
    const key = `${provider}/${modelId}`.toLowerCase();
    return AUTHORITATIVE_PROVIDER_CONTEXT_WINDOWS.get(key) ?? null;
}
function normalizeThinkingForModel(body, modelId) {
    const thinking = body?.thinking;
    if (thinking && typeof thinking === "object" && thinking.type === "disabled" && getModelSpec(modelId)?.rejectsThinkingDisabled) {
        const { thinking: _omitted, ...rest } = body;
        return rest;
    }
    return body;
}
function capMaxOutputTokens(modelId, requested) {
    const spec = getModelSpec(modelId);
    const cap = spec?.maxOutputTokens;
    const hasRequested = typeof requested === "number" && Number.isFinite(requested);
    if (typeof cap !== "number") return hasRequested ? requested : undefined;
    return hasRequested ? Math.min(requested, cap) : cap;
}
function getDefaultThinkingBudget(modelId) {
    return getModelSpec(modelId)?.defaultThinkingBudget ?? 0;
}
function isAdaptiveThinkingOnly(modelId) {
    if (typeof modelId !== "string" || modelId.length === 0) return false;
    return getModelSpec(modelId)?.adaptiveThinkingOnly === true;
}
function getMaxEffortWhenThinkingDisabled(modelId) {
    if (typeof modelId !== "string" || modelId.length === 0) return null;
    return getModelSpec(modelId)?.maxEffortWhenThinkingDisabled ?? null;
}
function capThinkingBudget(modelId, budget) {
    const cap = getModelSpec(modelId)?.thinkingBudgetCap ?? budget;
    return Math.min(budget, cap);
}
function resolveModelAlias(modelId) {
    const hit = getModelSpecIndex().aliasExact.get(modelId);
    return hit ?? modelId;
}
}),
"[project]/src/shared/constants/visionModels.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Single source of truth for the model-id vision heuristic (#4072).
 *
 * Three code paths used to keep their own drifting lists, so the same model id
 * could get up to three different vision verdicts:
 *   - `src/lib/modelCapabilities.ts` — last-resort fallback in `resolveVisionCapability` (#4071)
 *   - `src/app/api/v1/models/catalog.ts` — `/v1/models` listing capability
 *   - `open-sse/services/compression/lite.ts` — gate that decides whether lite
 *     compression strips images
 *
 * Concrete bugs that caused:
 *   - `lite.ts` was missing pixtral / llava / qwen-vl / glm-4v / kimi-vl /
 *     mistral-medium-3, so lite compression stripped images for those real vision
 *     models and blinded them (same class as #4071 / #4012).
 *   - `catalog.ts` was too broad: bare `gemma` (text) and bare `kimi` (e.g.
 *     `kimi-k2`, text) produced false-positive `vision: true` in `/v1/models`.
 *
 * Keep this list CONSERVATIVE: a false positive in routing or compression
 * re-creates #4071 (an image routed to / kept for a model that cannot see it).
 * The zero-touch path for newly released vision models is the models.dev sync
 * (`modalities` / `attachment`), not this fallback — this list only needs the
 * stable, well-known vision families.
 */ __turbopack_context__.s([
    "VISION_MODEL_ID_FRAGMENTS",
    ()=>VISION_MODEL_ID_FRAGMENTS,
    "isVisionModelId",
    ()=>isVisionModelId
]);
const VISION_MODEL_ID_FRAGMENTS = [
    "pixtral",
    "llava",
    "bakllava",
    "qwen-vl",
    "qwen2-vl",
    "qwen2.5-vl",
    "qwen3-vl",
    "qvq",
    "internvl",
    "minicpm-v",
    "moondream",
    "mimo-vl",
    "kimi-vl",
    "glm-4v",
    "glm-4.5v",
    "glm-4.6v",
    "gpt-4o",
    "gpt-4.1",
    "gpt-4-turbo",
    "gpt-4-vision",
    "gpt-5",
    "gemini-1.5",
    "gemini-2",
    "gemini-3",
    "gemini-exp",
    "claude-3",
    "claude-fable",
    "claude-opus-4",
    "claude-sonnet-4",
    "claude-haiku-4",
    "claude-fable",
    "mistral-medium-3",
    "minimax-m3",
    "kimi-k2.",
    "-vision",
    "multimodal"
];
function isVisionModelId(modelId) {
    if (!modelId) return false;
    const normalized = String(modelId).toLowerCase();
    return VISION_MODEL_ID_FRAGMENTS.some((fragment)=>normalized.includes(fragment));
}
}),
"[project]/src/shared/constants/appConfig.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_CONFIG",
    ()=>APP_CONFIG,
    "THEME_CONFIG",
    ()=>THEME_CONFIG
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$package$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/package.json.[json].mjs [app-route] (ecmascript)");
;
const APP_CONFIG = {
    name: "OmniRoute",
    description: "AI Gateway for Multi-Provider LLMs",
    version: __TURBOPACK__imported__module__$5b$project$5d2f$package$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].version
};
const THEME_CONFIG = {
    storageKey: "theme",
    defaultTheme: "system"
};
}),
"[project]/src/shared/utils/clineAuth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyClineAuthHeaders",
    ()=>applyClineAuthHeaders,
    "applyClineProtocolHeaders",
    ()=>applyClineProtocolHeaders,
    "buildClineHeaders",
    ()=>buildClineHeaders,
    "buildClinepassHeaders",
    ()=>buildClinepassHeaders,
    "getClineAccessToken",
    ()=>getClineAccessToken,
    "getClineAuthorizationHeader",
    ()=>getClineAuthorizationHeader,
    "resolveClineTaskId",
    ()=>resolveClineTaskId
]);
/**
 * Cline (cline.bot) auth-shape helpers.
 *
 * Cline's API expects the bearer token to be prefixed with `workos:` (the
 * upstream auth provider), and a set of Cline client-identification headers
 * (HTTP-Referer / X-Title / X-CLIENT-* / X-PLATFORM*). Plain `Bearer <token>`
 * without the `workos:` prefix is rejected upstream, so every Cline request
 * must route its headers through `buildClineHeaders()`.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/appConfig.ts [app-route] (ecmascript)");
;
;
const APP_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APP_CONFIG"].version;
function cleanHeaderValue(value) {
    if (typeof value !== "string") return undefined;
    const cleaned = value.trim();
    if (!cleaned || cleaned.length > 256 || /[\r\n\0]/.test(cleaned)) return undefined;
    return cleaned;
}
function getHeaderCaseInsensitive(headers, name) {
    const key = Object.keys(headers ?? {}).find((candidate)=>candidate.toLowerCase() === name);
    return key ? cleanHeaderValue(headers?.[key]) : undefined;
}
function resolveClineTaskId(clientHeaders) {
    return getHeaderCaseInsensitive(clientHeaders, "x-task-id") ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
}
function applyClineProtocolHeaders(headers, context = {}) {
    const taskId = cleanHeaderValue(context.taskId) ?? getHeaderCaseInsensitive(headers, "x-task-id") ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const clientVersion = cleanHeaderValue(context.clientVersion) ?? APP_VERSION;
    const required = {
        "HTTP-Referer": "https://cline.bot",
        "X-Title": "Cline",
        "User-Agent": `Cline/${clientVersion}`,
        "X-IS-MULTIROOT": context.isMultiRoot === true ? "true" : "false",
        "X-CLIENT-TYPE": cleanHeaderValue(context.clientType) ?? "omniroute",
        "X-CLIENT-VERSION": clientVersion,
        "X-PLATFORM": cleanHeaderValue(context.platform) ?? process.platform ?? "unknown",
        "X-PLATFORM-VERSION": cleanHeaderValue(context.platformVersion) ?? process.version ?? "unknown",
        "X-CORE-VERSION": cleanHeaderValue(context.coreVersion) ?? APP_VERSION,
        "X-Task-ID": taskId
    };
    for (const [name, value] of Object.entries(required)){
        for (const existing of Object.keys(headers)){
            if (existing !== name && existing.toLowerCase() === name.toLowerCase()) {
                delete headers[existing];
            }
        }
        headers[name] = value;
    }
    return headers;
}
function getClineAccessToken(token) {
    if (typeof token !== "string") return "";
    const trimmed = token.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("workos:") ? trimmed : `workos:${trimmed}`;
}
function getClineAuthorizationHeader(token) {
    const accessToken = getClineAccessToken(token);
    return accessToken ? `Bearer ${accessToken}` : "";
}
function buildClineHeaders(token, extraHeaders = {}, context = {}) {
    const authorization = getClineAuthorizationHeader(token);
    const headers = applyClineProtocolHeaders({
        ...extraHeaders
    }, context);
    if (authorization) {
        headers.Authorization = authorization;
    }
    return headers;
}
function buildClinepassHeaders(credentials, effectiveKey, context = {}) {
    if (credentials?.accessToken) {
        return buildClineHeaders(credentials.accessToken, {}, context);
    }
    const headers = applyClineProtocolHeaders({}, context);
    const byokKey = effectiveKey || credentials?.apiKey;
    if (byokKey) headers.Authorization = `Bearer ${byokKey}`;
    return headers;
}
function applyClineAuthHeaders(headers, credentials, effectiveKey, clientHeaders, isClinepass) {
    const context = {
        taskId: resolveClineTaskId(clientHeaders)
    };
    const built = isClinepass ? buildClinepassHeaders(credentials, effectiveKey, context) : buildClineHeaders(effectiveKey || credentials?.accessToken, {}, context);
    Object.assign(headers, built);
    return headers;
}
}),
"[project]/src/shared/utils/cliCompat.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeCliCompatProviderId",
    ()=>normalizeCliCompatProviderId
]);
function normalizeCliCompatProviderId(providerId) {
    const normalized = providerId.toLowerCase();
    if (normalized === "copilot") return "github";
    return normalized;
}
}),
"[project]/src/shared/utils/numeric.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Canonical numeric coercion helpers — DRY extraction from ~51 near-identical
 * local `toNumber` definitions scattered across `src/` and `open-sse/` (#7879).
 *
 * All three variants share the SAME strict coercion shape as the dominant
 * pre-existing pattern found across the codebase:
 *   - `number` inputs pass through only when `Number.isFinite`.
 *   - `string` inputs are `trim()`-med first; empty/whitespace-only strings
 *     are treated as absent. The trimmed string is coerced with `Number(...)`
 *     and accepted only when the result is finite (rejects `"12abc"`,
 *     `"Infinity"`, `"NaN"`, etc).
 *   - Every other type (`null`, `undefined`, `boolean`, `object`, `array`, ...)
 *     is treated as absent.
 *
 * This is intentionally the STRICT variant — it does NOT use `parseFloat`
 * (which would accept `"12abc"` -> `12`). A small number of call sites in the
 * codebase intentionally keep `parseFloat` (leniency is a documented,
 * deliberate behavior choice there, not a bug) — see
 * `open-sse/services/crofUsageFetcher.ts` for the annotated exception.
 *
 * Migration is happening tier-by-tier (report/analytics first, then
 * quota/billing, then hot-path auth/costRules/combo) to avoid silently
 * changing fallback semantics anywhere cost or quota math depends on it.
 * See the issue for the full plan.
 */ /**
 * Coerce an unknown value to a finite number, or return `fallback` (default
 * `0`) when the value cannot be strictly coerced.
 *
 * @param v - the value to coerce.
 * @param fallback - value returned when coercion fails (default `0`).
 */ __turbopack_context__.s([
    "toNumber",
    ()=>toNumber,
    "toNumberArray",
    ()=>toNumberArray,
    "toNumberOrNull",
    ()=>toNumberOrNull
]);
function toNumber(v, fallback = 0) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim().length > 0) {
        const parsed = Number(v.trim());
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function toNumberOrNull(v) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim().length > 0) {
        const parsed = Number(v.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}
function toNumberArray(v, fallback = []) {
    if (!Array.isArray(v)) return fallback;
    return v.map((item)=>toNumber(item, 0));
}
}),
"[project]/src/shared/resilience/peerRouting.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OMNIROUTE_PEER_TRACE_HEADER",
    ()=>OMNIROUTE_PEER_TRACE_HEADER,
    "applyPeerTraceHeader",
    ()=>applyPeerTraceHeader,
    "inspectPeerRequest",
    ()=>inspectPeerRequest,
    "isConfiguredOmniRoutePeer",
    ()=>isConfiguredOmniRoutePeer,
    "parsePeerTrace",
    ()=>parsePeerTrace,
    "rejectPeerRequest",
    ()=>rejectPeerRequest
]);
const DEFAULT_MAX_PEER_HOPS = 4;
const MAX_TRACE_HEADER_LENGTH = 2048;
const INSTANCE_ID_PATTERN = /^[A-Za-z0-9._:-]{1,64}$/;
const OMNIROUTE_PEER_TRACE_HEADER = "X-OmniRoute-Peer-Trace";
function readHeader(headers, name) {
    if (!headers) return null;
    if (headers instanceof Headers) return headers.get(name);
    const expected = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)){
        if (key.toLowerCase() === expected && typeof value === "string") return value;
    }
    return null;
}
function getInstanceId(env) {
    const value = env.OMNIROUTE_INSTANCE_ID?.trim() ?? "";
    return INSTANCE_ID_PATTERN.test(value) ? value : null;
}
function getMaxPeerHops(env) {
    const parsed = Number.parseInt(env.OMNIROUTE_PEER_MAX_HOPS ?? "", 10);
    return Number.isInteger(parsed) && parsed > 0 && parsed <= 32 ? parsed : DEFAULT_MAX_PEER_HOPS;
}
function parsePeerTrace(value) {
    if (!value || value.length > MAX_TRACE_HEADER_LENGTH) return [];
    return value.split(",").map((part)=>part.trim()).filter((part)=>INSTANCE_ID_PATTERN.test(part));
}
function normalizePeerUrl(value) {
    try {
        const url = new URL(value.trim());
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        return url;
    } catch  {
        return null;
    }
}
function isConfiguredOmniRoutePeer(targetUrl, env = process.env) {
    const target = normalizePeerUrl(targetUrl);
    if (!target) return false;
    return (env.OMNIROUTE_PEER_URLS ?? "").split(",").map(normalizePeerUrl).some((peer)=>{
        if (!peer || peer.origin !== target.origin) return false;
        const peerPath = peer.pathname.replace(/\/$/, "");
        const targetPath = target.pathname.replace(/\/$/, "");
        return targetPath === peerPath || targetPath.startsWith(`${peerPath}/`);
    });
}
function inspectPeerRequest(headers, env = process.env) {
    const instanceId = getInstanceId(env);
    if (!instanceId) return null;
    const trace = parsePeerTrace(readHeader(headers, OMNIROUTE_PEER_TRACE_HEADER));
    if (trace.includes(instanceId)) {
        return {
            code: "peer_loop_detected",
            message: "OmniRoute peer routing loop detected"
        };
    }
    if (trace.length >= getMaxPeerHops(env)) {
        return {
            code: "peer_hop_limit_exceeded",
            message: "OmniRoute peer routing hop limit exceeded"
        };
    }
    return null;
}
function rejectPeerRequest(headers, warn, respond) {
    const rejection = inspectPeerRequest(headers);
    if (!rejection) return null;
    warn("PEER_ROUTING", rejection.message);
    return respond(508, rejection.message);
}
function applyPeerTraceHeader(outgoingHeaders, clientHeaders, targetUrl, env = process.env) {
    const instanceId = getInstanceId(env);
    if (!instanceId || !isConfiguredOmniRoutePeer(targetUrl, env)) return false;
    const trace = parsePeerTrace(readHeader(clientHeaders, OMNIROUTE_PEER_TRACE_HEADER));
    if (!trace.includes(instanceId)) trace.push(instanceId);
    const traceHeaderLower = OMNIROUTE_PEER_TRACE_HEADER.toLowerCase();
    for (const key of Object.keys(outgoingHeaders)){
        if (key.toLowerCase() === traceHeaderLower) delete outgoingHeaders[key];
    }
    outgoingHeaders[OMNIROUTE_PEER_TRACE_HEADER] = trace.join(",");
    return true;
}
}),
"[project]/src/shared/utils/circuitBreaker.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CircuitBreaker",
    ()=>CircuitBreaker,
    "CircuitBreakerOpenError",
    ()=>CircuitBreakerOpenError,
    "STATE",
    ()=>STATE,
    "__getCircuitRegistrySizeForTests",
    ()=>__getCircuitRegistrySizeForTests,
    "getAllCircuitBreakerStatuses",
    ()=>getAllCircuitBreakerStatuses,
    "getCircuitBreaker",
    ()=>getCircuitBreaker,
    "isLocalStreamLifecycleError",
    ()=>isLocalStreamLifecycleError,
    "resetAllCircuitBreakers",
    ()=>resetAllCircuitBreakers
]);
/**
 * Circuit Breaker — FASE-04 Observability & Resilience (v2.0)
 *
 * Implements the circuit breaker pattern with:
 * - States: CLOSED → DEGRADED → OPEN → HALF_OPEN → CLOSED
 * - Adaptive backoff: resetTimeout escalates on repeated open→probe→open cycles
 * - Failure-kind-aware thresholds: different limits per failure type
 * - Progressive degradation: high failure rate triggers warning before full open
 * - Transition history tracking for diagnostics
 * - DB persistence via domainState.js
 *
 * States:
 *   CLOSED    — Normal operation, requests pass through
 *   DEGRADED  — Failure rate elevated, requests pass through but warnings logged
 *   OPEN      — Requests are short-circuited
 *   HALF_OPEN — Probing: limited requests allowed to test recovery
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/domainState.ts [app-route] (ecmascript)");
;
function isLocalStreamLifecycleError(error) {
    if (!error) return false;
    const errName = typeof error.name === "string" ? error.name : "";
    if (errName === "AbortError") return true;
    const message = typeof error === "string" ? error : typeof error.message === "string" ? error.message : "";
    if (!message) return false;
    return /controller is already closed/i.test(message) || /request_signal_aborted/i.test(message) || /client disconnected/i.test(message) || /operation was aborted/i.test(message);
}
const STATE = {
    CLOSED: "CLOSED",
    DEGRADED: "DEGRADED",
    OPEN: "OPEN",
    HALF_OPEN: "HALF_OPEN"
};
class CircuitBreaker {
    name;
    failureThreshold;
    resetTimeout;
    halfOpenRequests;
    onStateChange;
    isFailure;
    state;
    failureCount;
    successCount;
    lastFailureTime;
    halfOpenAllowed;
    cooldownByKind;
    classifyError;
    lastFailureKind;
    kindThresholds;
    degradationThreshold;
    maxBackoffMultiplier;
    backoffEscalationCount;
    /** Track failure counts per kind separately */ kindFailureCounts;
    /** How many times has the breaker gone from OPEN → HALF_OPEN → OPEN */ openCycleCount;
    /** State transition history */ transitionHistory;
    /** Max transition history entries */ maxTransitionHistory;
    constructor(name, options = {}){
        this.name = name;
        this.failureThreshold = options.failureThreshold ?? 5;
        this.resetTimeout = options.resetTimeout ?? 30000;
        this.halfOpenRequests = options.halfOpenRequests ?? 1;
        this.onStateChange = options.onStateChange || null;
        this.isFailure = options.isFailure || (()=>true);
        this.state = STATE.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.halfOpenAllowed = 0;
        this.cooldownByKind = options.cooldownByKind ?? {};
        this.classifyError = options.classifyError ?? null;
        this.lastFailureKind = null;
        this.kindThresholds = options.kindThresholds ?? {};
        this.degradationThreshold = options.degradationThreshold ?? Math.ceil(this.failureThreshold * 60 / 100);
        this.maxBackoffMultiplier = options.maxBackoffMultiplier ?? 16;
        this.backoffEscalationCount = options.backoffEscalationCount ?? 3;
        this.kindFailureCounts = {};
        this.openCycleCount = 0;
        this.transitionHistory = [];
        this.maxTransitionHistory = 20;
        this._restoreFromDb();
    }
    _restoreFromDb() {
        try {
            const saved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadCircuitBreakerState"])(this.name);
            if (saved) {
                if (saved.state === STATE.CLOSED || saved.state === STATE.DEGRADED || saved.state === STATE.OPEN || saved.state === STATE.HALF_OPEN) {
                    this.state = saved.state;
                }
                this.failureCount = saved.failureCount;
                this.lastFailureTime = saved.lastFailureTime;
                const savedKind = saved.options?.lastFailureKind;
                if (savedKind === "rate_limit" || savedKind === "quota_exhausted" || savedKind === "transient") {
                    this.lastFailureKind = savedKind;
                }
                this.openCycleCount = saved.options?.openCycleCount ?? 0;
                this.kindFailureCounts = saved.options?.kindFailureCounts ?? {};
                if (this.state === STATE.HALF_OPEN) {
                    this.halfOpenAllowed = this.halfOpenRequests;
                }
            }
        } catch  {
        // DB may not be ready yet (build phase)
        }
    }
    _persistToDb() {
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveCircuitBreakerState"])(this.name, {
                state: this.state,
                failureCount: this.failureCount,
                lastFailureTime: this.lastFailureTime,
                options: {
                    failureThreshold: this.failureThreshold,
                    resetTimeout: this.resetTimeout,
                    halfOpenRequests: this.halfOpenRequests,
                    lastFailureKind: this.lastFailureKind,
                    openCycleCount: this.openCycleCount,
                    kindFailureCounts: this.kindFailureCounts
                }
            });
        } catch  {
        // Non-critical
        }
    }
    /**
   * Get the effective reset timeout, escalated by open cycle count.
   * Each open→half_open→open cycle multiplies the timeout.
   */ _effectiveResetTimeout() {
        if (this.openCycleCount <= this.backoffEscalationCount) {
            return this.resetTimeout;
        }
        const escalationFactor = Math.pow(2, this.openCycleCount - this.backoffEscalationCount);
        return Math.min(this.resetTimeout * escalationFactor, this.resetTimeout * this.maxBackoffMultiplier);
    }
    async execute(fn) {
        this._refreshOpenState();
        if (this.state === STATE.OPEN) {
            throw new CircuitBreakerOpenError(`Circuit breaker "${this.name}" is OPEN. Try again later.`, this.name, this._timeUntilReset());
        }
        if (this.state === STATE.HALF_OPEN && this.halfOpenAllowed <= 0) {
            throw new CircuitBreakerOpenError(`Circuit breaker "${this.name}" is HALF_OPEN, no more probe requests allowed.`, this.name, this._timeUntilReset());
        }
        if (this.state === STATE.HALF_OPEN) {
            this.halfOpenAllowed--;
        }
        try {
            const result = await fn();
            this._onSuccess();
            return result;
        } catch (error) {
            if (this.isFailure(error)) {
                let kind;
                if (this.classifyError) {
                    try {
                        kind = this.classifyError(error);
                    } catch  {
                        kind = undefined;
                    }
                }
                this._onFailure(kind);
            }
            throw error;
        }
    }
    canExecute() {
        this._refreshOpenState();
        if (this.state === STATE.CLOSED || this.state === STATE.DEGRADED) return true;
        if (this.state === STATE.OPEN) return false;
        if (this.state === STATE.HALF_OPEN) return this.halfOpenAllowed > 0;
        return false;
    }
    getStatus() {
        this._refreshOpenState();
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            lastFailureTime: this.lastFailureTime,
            retryAfterMs: this.getRetryAfterMs(),
            lastFailureKind: this.lastFailureKind,
            openCycleCount: this.openCycleCount,
            kindFailureCounts: {
                ...this.kindFailureCounts
            },
            degradationThreshold: this.degradationThreshold,
            effectiveResetTimeout: this._effectiveResetTimeout()
        };
    }
    getRetryAfterMs() {
        this._refreshOpenState();
        if (this.state === STATE.CLOSED || this.state === STATE.DEGRADED) return 0;
        return this._timeUntilReset();
    }
    reset() {
        this._transition(STATE.CLOSED, "manual-reset");
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.lastFailureKind = null;
        this.openCycleCount = 0;
        this.kindFailureCounts = {};
        this._persistToDb();
    }
    // ─── Internal ─────────────────────────────────
    _onSuccess() {
        if (this.state === STATE.OPEN) {
            this._transition(STATE.CLOSED, "success-recovery");
            this.failureCount = 0;
            this.successCount = 0;
            this.lastFailureTime = null;
            this.lastFailureKind = null;
            this.openCycleCount = 0;
            this.kindFailureCounts = {};
        } else if (this.state === STATE.HALF_OPEN) {
            this.successCount++;
            this._transition(STATE.CLOSED, "probe-success");
            this.failureCount = 0;
            this.lastFailureKind = null;
            this.openCycleCount = 0;
            this.kindFailureCounts = {};
        } else {
            // CLOSED or DEGRADED: reset counts
            this.failureCount = Math.max(0, this.failureCount - 1); // gradual recovery
            if (this.state === STATE.DEGRADED && this.failureCount <= this.degradationThreshold) {
                this._transition(STATE.CLOSED, "recovery");
            }
        }
        this._persistToDb();
    }
    _onFailure(kind) {
        const failureKind = kind ?? null;
        this.failureCount++;
        this.lastFailureTime = Date.now();
        this.lastFailureKind = failureKind;
        // Track per-kind failure counts
        if (failureKind) {
            this.kindFailureCounts[failureKind] = (this.kindFailureCounts[failureKind] || 0) + 1;
        }
        // Check kind-specific thresholds
        if (failureKind) {
            const kindConfig = this.kindThresholds[failureKind];
            if (kindConfig) {
                const kindCount = this.kindFailureCounts[failureKind] || 0;
                // Immediate open for critical failure kinds
                if (kindConfig.immediateOpen && kindCount >= (kindConfig.threshold || 1)) {
                    this._openCircuit(failureKind);
                    return;
                }
                // Kind-specific threshold reached
                if (kindCount >= (kindConfig.threshold || this.failureThreshold)) {
                    this._openCircuit(failureKind);
                    return;
                }
            }
        }
        // State transitions based on total failure count
        if (this.state === STATE.OPEN) {
        // Already OPEN — just update persistence
        } else if (this.state === STATE.HALF_OPEN) {
            // Probe failed: OPEN with cycle count escalation
            this.openCycleCount++;
            this._transition(STATE.OPEN, `probe-failed (cycle ${this.openCycleCount})`);
        } else if (this.state === STATE.DEGRADED) {
            // Degraded → Open when threshold reached
            if (this.failureCount >= this.failureThreshold) {
                this._openCircuit(failureKind);
            }
        } else {
            // CLOSED → DEGRADED or OPEN
            if (this.failureCount >= this.failureThreshold) {
                this._openCircuit(failureKind);
            } else if (this.failureCount >= this.degradationThreshold) {
                this._transition(STATE.DEGRADED, `elevated-failures (${this.failureCount}/${this.failureThreshold})`);
            }
        }
        this._persistToDb();
    }
    _openCircuit(kind) {
        this._transition(STATE.OPEN, kind ? `kind:${kind}` : undefined);
    }
    _shouldAttemptReset() {
        if (!this.lastFailureTime) return true;
        const cooldown = this._effectiveCooldown();
        return Date.now() - this.lastFailureTime >= cooldown;
    }
    _effectiveCooldown() {
        const baseTimeout = this._effectiveResetTimeout();
        if (this.lastFailureKind !== null) {
            const override = this.cooldownByKind[this.lastFailureKind];
            if (typeof override === "number" && Number.isFinite(override) && override >= 0) {
                return override;
            }
        }
        return baseTimeout;
    }
    _timeUntilReset() {
        if (!this.lastFailureTime) return 0;
        const cooldown = this._effectiveCooldown();
        return Math.max(0, cooldown - (Date.now() - this.lastFailureTime));
    }
    _refreshOpenState() {
        if (this.state === STATE.OPEN && this._shouldAttemptReset()) {
            this._transition(STATE.HALF_OPEN, "timeout-elapsed");
            this._persistToDb();
        }
    }
    _transition(newState, reason) {
        const oldState = this.state;
        this.state = newState;
        if (newState === STATE.HALF_OPEN) {
            this.halfOpenAllowed = this.halfOpenRequests;
        }
        // Record transition
        this.transitionHistory.push({
            from: oldState,
            to: newState,
            timestamp: Date.now(),
            failureCount: this.failureCount,
            reason
        });
        if (this.transitionHistory.length > this.maxTransitionHistory) {
            this.transitionHistory.shift();
        }
        if (this.onStateChange && oldState !== newState) {
            this.onStateChange(this.name, oldState, newState);
        }
    }
}
class CircuitBreakerOpenError extends Error {
    circuitName;
    retryAfterMs;
    constructor(message, circuitName, retryAfterMs){
        super(message);
        this.name = "CircuitBreakerOpenError";
        this.circuitName = circuitName;
        this.retryAfterMs = retryAfterMs;
    }
}
// ─── Registry ─────────────────────────────────────
const MAX_REGISTRY_SIZE = 500;
const registry = new Map();
function __getCircuitRegistrySizeForTests() {
    return registry.size;
}
const _registrySweep = setInterval(()=>{
    const now = Date.now();
    for (const [name, breaker] of registry){
        const status = breaker.getStatus();
        if (status.state === STATE.CLOSED && status.failureCount === 0 && (!status.lastFailureTime || now - status.lastFailureTime > 30 * 60 * 1000)) {
            registry.delete(name);
            try {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCircuitBreakerState"])(name);
            } catch  {}
        }
    }
}, 5 * 60_000);
if (typeof _registrySweep === "object" && "unref" in _registrySweep) {
    _registrySweep.unref?.();
}
/**
 * Enforce MAX_REGISTRY_SIZE before inserting a new breaker. The cap was previously declared
 * but never used — the only bound was the 5-min sweep, which evicts a breaker only if it is
 * CLOSED, has zero failures, AND has been idle for >30 min. With high-cardinality breaker
 * names that cap could be exceeded for up to 30 min. Evict idle CLOSED breakers (oldest first)
 * to make room; never evict OPEN/HALF_OPEN breakers, since those carry meaningful state. A
 * CLOSED breaker with zero failures is behaviorally identical to a freshly-created one, so
 * evicting and lazily recreating it later changes nothing.
 */ function evictColdBreakersIfNeeded() {
    if (registry.size < MAX_REGISTRY_SIZE) return;
    const candidates = [];
    for (const [name, breaker] of registry){
        const status = breaker.getStatus();
        if (status.state === STATE.CLOSED && status.failureCount === 0) {
            candidates.push({
                name,
                lastFailureTime: status.lastFailureTime || 0
            });
        }
    }
    candidates.sort((a, b)=>a.lastFailureTime - b.lastFailureTime);
    const target = registry.size - MAX_REGISTRY_SIZE + 1;
    for(let i = 0; i < candidates.length && i < target; i++){
        registry.delete(candidates[i].name);
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCircuitBreakerState"])(candidates[i].name);
        } catch  {}
    }
}
function getCircuitBreaker(name, options) {
    if (!registry.has(name)) {
        evictColdBreakersIfNeeded();
        registry.set(name, new CircuitBreaker(name, options));
    }
    const breaker = registry.get(name);
    if (options) {
        if (typeof options.failureThreshold === "number") {
            breaker.failureThreshold = options.failureThreshold;
        }
        if (typeof options.resetTimeout === "number") {
            breaker.resetTimeout = options.resetTimeout;
        }
        if (typeof options.halfOpenRequests === "number") {
            breaker.halfOpenRequests = options.halfOpenRequests;
            if (breaker.state === STATE.HALF_OPEN) {
                breaker.halfOpenAllowed = Math.min(breaker.halfOpenAllowed, breaker.halfOpenRequests);
            }
        }
        if (typeof options.onStateChange === "function") {
            breaker.onStateChange = options.onStateChange;
        }
        if (typeof options.isFailure === "function") {
            breaker.isFailure = options.isFailure;
        }
        if (options.cooldownByKind) {
            breaker.cooldownByKind = {
                ...breaker.cooldownByKind,
                ...options.cooldownByKind
            };
        }
        if (typeof options.classifyError === "function") {
            breaker.classifyError = options.classifyError;
        }
        if (options.kindThresholds) {
            breaker.kindThresholds = {
                ...breaker.kindThresholds,
                ...options.kindThresholds
            };
        }
        if (typeof options.degradationThreshold === "number") {
            breaker.degradationThreshold = options.degradationThreshold;
        }
        if (typeof options.maxBackoffMultiplier === "number") {
            breaker.maxBackoffMultiplier = options.maxBackoffMultiplier;
        }
        if (typeof options.backoffEscalationCount === "number") {
            breaker.backoffEscalationCount = options.backoffEscalationCount;
        }
        breaker._persistToDb();
    }
    return breaker;
}
function getAllCircuitBreakerStatuses() {
    try {
        const persisted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadAllCircuitBreakerStates"])();
        for (const cb of persisted){
            if (!registry.has(cb.name)) {
                getCircuitBreaker(cb.name);
            }
        }
    } catch  {
    // Use registry only
    }
    return Array.from(registry.values()).map((cb)=>cb.getStatus());
}
function resetAllCircuitBreakers() {
    for (const cb of registry.values()){
        cb.reset();
    }
    registry.clear();
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteAllCircuitBreakerStates"])();
    } catch  {
    // Non-critical
    }
}
}),
"[project]/src/shared/utils/classify429.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 429 response classifier — distinguish rate-limit from quota-exhausted.
 *
 * Most LLM providers return HTTP 429 for two semantically different reasons:
 *
 * 1. **Rate-limit**: short transient back-off ("too many requests in
 *    the last minute"). Fix: wait the Retry-After window and retry.
 * 2. **Quota-exhausted**: long-period cap hit ("daily/monthly limit
 *    reached"). Fix: wait until the period rolls over (could be hours
 *    or days). Retrying every 60s wastes calls and burns alerts.
 *
 * The HTTP status alone cannot disambiguate. This helper inspects the
 * response body and headers to return a `FailureKind` the circuit
 * breaker can use to pick the right cooldown.
 *
 * Companion to OmniRoute issue #2100.
 *
 * @module shared/utils/classify429
 */ __turbopack_context__.s([
    "classify429",
    ()=>classify429,
    "classify429FromError",
    ()=>classify429FromError,
    "looksLikeQuotaExhausted",
    ()=>looksLikeQuotaExhausted,
    "parseRetryAfter",
    ()=>parseRetryAfter,
    "retryAfterFromResponse",
    ()=>retryAfterFromResponse
]);
/**
 * Heuristic regexes for "explicit quota exhausted" vs "rate-limited"
 * detection in 429 error bodies. A 429 alone never implies quota
 * exhausted — only an explicit keyword does.
 *
 * Patterns observed across OpenAI, Anthropic, Groq, Cerebras, Mistral,
 * Google Gemini, and OpenRouter free-tier responses.
 */ const QUOTA_PATTERNS = [
    /daily.*limit/i,
    /daily.*quota/i,
    /per.?day.*limit/i,
    /monthly.*limit/i,
    /monthly.*quota/i,
    /per.?month.*limit/i,
    /quota.*exceed/i,
    /exceed.*quota/i,
    /insufficient.*quota/i,
    /billing.*cap/i,
    /credit.*exhaust/i,
    /out of credits/i,
    /hard.?limit/i,
    /plan.*limit/i,
    // Antigravity / Cloud Code quota exhaustion ("Individual quota reached.
    // Contact your administrator to enable overages. Resets in 164h27m24s.").
    // None of the patterns above match it, so the 429 was misclassified as a
    // transient rate-limit and locked for only ~5s instead of the real window.
    // Keep these specific: a bare /quota reached/ would also flag transient
    // per-minute limits like "request quota reached, retry in 60s".
    /individual quota reached/i,
    /enable overages/i,
    /INSUFFICIENT_G1_CREDITS_BALANCE/i,
    // Google APIs return this generic RESOURCE_EXHAUSTED message when a
    // billing-period quota has been consumed. Keep the reset-window qualifier
    // so transient Google rate limits are not treated as long-term exhaustion.
    /resource has been exhausted.*reset after/i,
    // Cloudflare Workers AI daily neuron exhaustion (Issue #6980).
    // Body: "you have used up your daily free allocation of 10,000 neurons,
    //        please upgrade to Cloudflare's Workers Paid plan..."
    // No existing pattern matches "daily free allocation" — without this,
    // the 429 is misclassified as transient rate_limit and retried every
    // ~60s against a budget that only resets at UTC midnight.
    /daily free allocation/i,
    // Modal-hosted OpenAI-compatible endpoints (e.g. self-hosted Kimi K3).
    // Body: {"error":"usage limit reached"}, no nested "message"/"quota"/
    // "daily" wording. Without this pattern the 429 falls through to
    // "rate_limit" (short cooldown), so combo round-robin's per-conversation
    // session stickiness (#3825) keeps re-targeting the same exhausted
    // connection every turn instead of a long lockout that lets the sticky
    // target fail over to another account.
    //
    // Matches the "error" JSON key with "usage limit reached" as its value.
    // Extra sibling fields (e.g. {"error":"usage limit reached", "code":"..."})
    // still match. A different key like {"detail":"..."} or a qualified value
    // like {"error":"Per-minute usage limit reached"} does NOT match. Bare
    // string bodies without a JSON wrapper also do NOT match.
    // Trailing punctuation/whitespace before the closing quote is tolerated
    // because real API responses may include a period or trailing space.
    /"error"\s*:\s*"usage limit reached[.\s]*"/i
];
/**
 * Best-effort case-insensitive header lookup.
 */ function getHeader(headers, name) {
    if (!headers) return undefined;
    const target = name.toLowerCase();
    for (const [k, v] of Object.entries(headers)){
        if (k.toLowerCase() === target) return v;
    }
    return undefined;
}
/**
 * Coerce a body of unknown shape to a string for keyword scanning.
 * - string: returned as-is
 * - object: JSON-stringified (so nested error.message gets scanned)
 * - undefined/null: empty string
 */ function bodyToText(body) {
    if (typeof body === "string") return body;
    if (body == null) return "";
    try {
        return JSON.stringify(body);
    } catch  {
        return "";
    }
}
function looksLikeQuotaExhausted(body) {
    const text = bodyToText(body);
    if (!text) return false;
    return QUOTA_PATTERNS.some((pat)=>pat.test(text));
}
function classify429(response) {
    if (response.status !== 429) return "transient";
    if (looksLikeQuotaExhausted(response.body)) return "quota_exhausted";
    return "rate_limit";
}
function parseRetryAfter(headerValue) {
    if (!headerValue) return null;
    const trimmed = headerValue.trim();
    if (!trimmed) return null;
    // Groq-style relative: must check BEFORE plain int parse.
    const relMatch = trimmed.match(/^(\d+)([smh])$/i);
    if (relMatch) {
        const n = Number(relMatch[1]);
        const unit = relMatch[2].toLowerCase();
        if (Number.isFinite(n)) {
            if (unit === "s") return n;
            if (unit === "m") return n * 60;
            if (unit === "h") return n * 3600;
        }
    }
    // Pure integer seconds.
    if (/^\d+$/.test(trimmed)) {
        const n = Number(trimmed);
        return Number.isFinite(n) ? n : null;
    }
    // HTTP date.
    const ts = Date.parse(trimmed);
    if (Number.isFinite(ts)) {
        return Math.max(0, Math.floor((ts - Date.now()) / 1000));
    }
    return null;
}
function retryAfterFromResponse(response) {
    return parseRetryAfter(getHeader(response.headers, "retry-after"));
}
/**
 * Normalize an unknown headers-like value into a plain `Record<string, string>`.
 * Native `Headers` (from `fetch`) does NOT respond to `Object.entries` — it
 * exposes `.entries()` instead. Without this normalization, `getHeader` would
 * silently miss every header on a Headers instance.
 */ function normalizeHeaders(raw) {
    if (raw === null || typeof raw !== "object") return undefined;
    const maybeIter = raw.entries;
    if (typeof maybeIter === "function") {
        try {
            return Object.fromEntries(raw.entries());
        } catch  {
        // fall through to plain-object treatment
        }
    }
    return raw;
}
function classify429FromError(err) {
    if (err === null || typeof err !== "object") return undefined;
    const e = err;
    let status;
    let headers;
    let body;
    if (typeof e.status === "number") {
        status = e.status;
    }
    if (typeof e.statusCode === "number" && status === undefined) {
        status = e.statusCode;
    }
    if (e.response && typeof e.response === "object") {
        const resp = e.response;
        if (typeof resp.status === "number" && status === undefined) {
            status = resp.status;
        }
        if (resp.headers && typeof resp.headers === "object") {
            headers = normalizeHeaders(resp.headers);
        }
        if (resp.data !== undefined) {
            body = resp.data;
        } else if (typeof resp.body !== "undefined") {
            body = resp.body;
        }
    }
    if (headers === undefined && e.headers && typeof e.headers === "object") {
        headers = normalizeHeaders(e.headers);
    }
    if (body === undefined) {
        if (typeof e.body !== "undefined") {
            body = e.body;
        } else if (typeof e.message === "string") {
            body = e.message;
        }
    }
    if (typeof status !== "number") return undefined;
    return classify429({
        status,
        headers,
        body
    });
}
}),
"[project]/src/shared/utils/providerHints.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "defaultUseUpstream429BreakerHints",
    ()=>defaultUseUpstream429BreakerHints,
    "resolveUseUpstream429BreakerHints",
    ()=>resolveUseUpstream429BreakerHints
]);
/**
 * Per-provider default policy for upstream 429 hint trust.
 *
 * @see Issue #2100 follow-up — surface a user-overridable per-profile toggle
 * that decides whether the circuit breaker uses upstream 429 body / Retry-After
 * hints (`classify429`, `cooldownByKind`) to differentiate rate-limit from
 * quota-exhausted failure cooldowns.
 *
 * This helper returns the **default** answer for a given provider. The actual
 * runtime decision is the user override (if any) OR this default. See
 * `accountFallback.ts` / `chat.ts` / `chatHelpers.ts` for the resolution
 * call sites:
 *
 * ```ts
 * const userValue = providerProfile.useUpstream429BreakerHints; // boolean | undefined
 * const useHints  = userValue !== undefined
 *   ? userValue
 *   : defaultUseUpstream429BreakerHints(provider);
 * ```
 *
 * Default policy: direct cloud providers default `true` because their 429
 * bodies and `Retry-After` headers are authoritative. Reverse-proxy /
 * self-hosted / CLI-backed providers default `false` because forwarded 429
 * metadata is often unreliable or fabricated by the proxy.
 *
 * @module shared/utils/providerHints
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$upstream$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/upstream-proxy.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function defaultUseUpstream429BreakerHints(providerId) {
    if (Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$upstream$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UPSTREAM_PROXY_PROVIDERS"], providerId)) {
        return false;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLocalProvider"])(providerId)) {
        return false;
    }
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SELF_HOSTED_CHAT_PROVIDER_IDS"].has(providerId)) {
        return false;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId)) {
        return false;
    }
    return true;
}
function resolveUseUpstream429BreakerHints(providerId, userValue) {
    if (userValue !== undefined) {
        return userValue;
    }
    return defaultUseUpstream429BreakerHints(providerId);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/shared/utils/compatibleProviderId.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const COMPATIBLE_PROVIDER_ID_PATTERN = new RegExp(`^(?:${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OPENAI_COMPATIBLE_PREFIX"]}(?:chat|responses)-|${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ANTHROPIC_COMPATIBLE_PREFIX"]}(?:cc-)?)[0-9a-f-]+$`, "i");
function isCompatibleProviderConnectionId(providerId) {
    return typeof providerId === "string" && COMPATIBLE_PROVIDER_ID_PATTERN.test(providerId);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/shared/services/loginShellPath.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCachedLoginShellPath",
    ()=>getCachedLoginShellPath,
    "getLoginShellPath",
    ()=>getLoginShellPath,
    "mergeShellPath",
    ()=>mergeShellPath,
    "parseShellPathOutput",
    ()=>parseShellPathOutput
]);
// Login-shell PATH resolution (#3321).
//
// macOS GUI / Electron apps do NOT inherit the user's interactive shell PATH: a packaged
// app launched from Finder/Dock gets the truncated GUI PATH (/usr/bin:/bin:/usr/sbin:/sbin),
// missing Homebrew (/opt/homebrew/bin), nvm/volta shims, ~/.local/bin, etc. So any CLI
// detection (`which`, `command -v`) or CLI spawn run from that process can't find tools
// that ARE on the user's shell PATH — every CLI shows up as "not installed". We recover
// the real PATH by asking the user's login shell for it, then merge it into the lookup env.
//
// The pure helpers below are unit-tested with an injected shell runner; only the actual
// `$SHELL -ilc` spawn is platform-dependent.
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
function mergeShellPath(basePath, extraPath, delimiter = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].delimiter) {
    const seen = new Set();
    const out = [];
    for (const entry of [
        ...basePath.split(delimiter),
        ...extraPath.split(delimiter)
    ]){
        const trimmed = entry.trim();
        if (!trimmed || seen.has(trimmed)) continue;
        seen.add(trimmed);
        out.push(trimmed);
    }
    return out.join(delimiter);
}
function parseShellPathOutput(output) {
    if (!output) return null;
    for (const line of output.split("\n")){
        if (line.startsWith("PATH=")) {
            return line.slice("PATH=".length).trim() || null;
        }
    }
    return null;
}
function getLoginShellPath(opts = {}) {
    const platform = opts.platform ?? process.platform;
    if (platform !== "darwin") return null;
    const shell = opts.shell || process.env.SHELL || "/bin/zsh";
    if (!/^[\w./-]+$/.test(shell)) return null;
    const run = opts.runShell || ((sh)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["execFileSync"])(sh, [
            "-ilc",
            "command -p env"
        ], {
            encoding: "utf8",
            timeout: 3000,
            stdio: [
                "ignore",
                "pipe",
                "ignore"
            ]
        }));
    try {
        return parseShellPathOutput(run(shell));
    } catch  {
        return null;
    }
}
// The `$SHELL -ilc` spawn costs ~100-500ms, so compute it once per process.
let cached;
function getCachedLoginShellPath() {
    if (cached === undefined) cached = getLoginShellPath();
    return cached;
}
}),
"[project]/src/shared/services/cliInstallFallback.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "withSettingsFallback",
    ()=>withSettingsFallback
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
;
const withSettingsFallback = (settingsPath, notInstalledResult)=>{
    if (notInstalledResult.reason !== "not_found") return notInstalledResult;
    if (!settingsPath || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(settingsPath)) return notInstalledResult;
    return {
        installed: true,
        runnable: false,
        command: notInstalledResult.command,
        commandPath: null,
        reason: "settings_found_binary_unresolved",
        runtimeMode: notInstalledResult.runtimeMode,
        requiresBinary: notInstalledResult.requiresBinary
    };
};
}),
"[project]/src/shared/services/cliRuntimeGrokBuild.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Runtime-detection metadata entries extracted from cliRuntime.ts to keep that
// frozen file under its file-size ratchet cap (config/quality/file-size-baseline.json).
// Deliberately untyped (matches cliRuntime.ts's own `Record<string, any>` CLI_TOOLS
// shape) and has NO import of the CliCatalogEntry schema — keep it that way, so this
// module never drags src/shared/schemas/cliCatalog.ts into the typecheck-core
// transitive graph (that file is not on typecheck:core's curated allowlist).
/** Grok Build runtime-detection metadata (binary lookup + healthcheck). */ __turbopack_context__.s([
    "AMP_RUNTIME_ENTRY",
    ()=>AMP_RUNTIME_ENTRY,
    "GROK_BUILD_RUNTIME_ENTRY",
    ()=>GROK_BUILD_RUNTIME_ENTRY
]);
const GROK_BUILD_RUNTIME_ENTRY = {
    defaultCommand: "grok",
    envBinKey: "CLI_GROK_BUILD_BIN",
    requiresBinary: true,
    healthcheckTimeoutMs: 8000,
    paths: {
        config: ".grok/config.toml"
    }
};
const AMP_RUNTIME_ENTRY = {
    defaultCommand: "amp",
    envBinKey: "CLI_AMP_BIN",
    requiresBinary: true,
    healthcheckTimeoutMs: 12000,
    paths: {}
};
}),
"[project]/src/shared/services/cliRuntimeKnownPath.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Known-install-path trust & candidate-matching helpers for cliRuntime.ts.
 *
 * Extracted from cliRuntime.ts (which is at its frozen file-size budget) so the
 * #7753/#7774 fixes don't grow that file. Both helpers are dependency-injected
 * (no import back into cliRuntime.ts) to avoid a circular module reference.
 */ __turbopack_context__.s([
    "findKnownPathMatch",
    ()=>findKnownPathMatch,
    "isLocationTrusted",
    ()=>isLocationTrusted
]);
const isLocationTrusted = async (commandPath, realPath, expectedParentPaths, isPathWithin, realpath)=>{
    for (const parent of expectedParentPaths){
        if (isPathWithin(commandPath, parent) || isPathWithin(realPath, parent)) {
            return true;
        }
        try {
            const resolvedParent = await realpath(parent);
            if (isPathWithin(commandPath, resolvedParent) || isPathWithin(realPath, resolvedParent)) {
                return true;
            }
        } catch  {
        // Ignore missing/unresolvable parents and continue checking the remaining ones.
        }
    }
    return false;
};
const findKnownPathMatch = async (knownPaths, checkKnownPath)=>{
    let bestFailure = null;
    for (const knownPath of knownPaths){
        const result = await checkKnownPath(knownPath);
        if (result.installed) {
            return {
                match: result,
                bestFailure: null
            };
        }
        if (result.reason && result.reason !== "not_found" && !bestFailure) {
            bestFailure = result;
        }
    }
    return {
        match: null,
        bestFailure
    };
};
}),
"[project]/src/shared/services/cliRuntimeHealthcheckPath.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildHealthcheckPath",
    ()=>buildHealthcheckPath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
const buildHealthcheckPath = (callerPath, nodeBinDir)=>{
    const entries = callerPath.split(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].delimiter);
    if (entries.includes(nodeBinDir)) {
        return callerPath;
    }
    return [
        callerPath,
        nodeBinDir
    ].filter(Boolean).join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].delimiter);
};
}),
"[project]/src/shared/services/cliRuntime.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLI_TOOL_IDS",
    ()=>CLI_TOOL_IDS,
    "checkKnownPath",
    ()=>checkKnownPath,
    "ensureCliConfigWriteAllowed",
    ()=>ensureCliConfigWriteAllowed,
    "getCliConfigHome",
    ()=>getCliConfigHome,
    "getCliConfigPaths",
    ()=>getCliConfigPaths,
    "getCliPrimaryConfigPath",
    ()=>getCliPrimaryConfigPath,
    "getCliRuntimeStatus",
    ()=>getCliRuntimeStatus,
    "getKnownToolPaths",
    ()=>getKnownToolPaths,
    "getLookupEnv",
    ()=>getLookupEnv,
    "getOpenCodeConfigPath",
    ()=>getOpenCodeConfigPath,
    "isCliConfigWriteAllowed",
    ()=>isCliConfigWriteAllowed,
    "locateCommand",
    ()=>locateCommand,
    "resolveOpencodeConfigDir",
    ()=>resolveOpencodeConfigDir,
    "resolveOpencodeConfigPath",
    ()=>resolveOpencodeConfigPath,
    "shouldUseShellForCommand",
    ()=>shouldUseShellForCommand
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cli$2d$helper$2f$config$2d$generator$2f$hermesHome$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cli-helper/config-generator/hermesHome.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$loginShellPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/loginShellPath.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliInstallFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/cliInstallFallback.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntimeGrokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/cliRuntimeGrokBuild.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntimeKnownPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/cliRuntimeKnownPath.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntimeHealthcheckPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/cliRuntimeHealthcheckPath.ts [app-route] (ecmascript)");
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
const VALID_RUNTIME_MODES = new Set([
    "auto",
    "host",
    "container"
]);
const FALSE_VALUES = new Set([
    "0",
    "false",
    "no",
    "off"
]);
const CLI_TOOLS = {
    claude: {
        defaultCommand: "claude",
        envBinKey: "CLI_CLAUDE_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 4000,
        paths: {
            settings: ".claude/settings.json",
            auth: [
                ".claude/.credentials.json",
                ".config/claude/credentials.json"
            ]
        }
    },
    codex: {
        defaultCommand: "codex",
        envBinKey: "CLI_CODEX_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 4000,
        paths: {
            config: ".codex/config.toml",
            auth: ".codex/auth.json"
        }
    },
    droid: {
        defaultCommand: "droid",
        envBinKey: "CLI_DROID_BIN",
        requiresBinary: true,
        // Droid CLI can be slow on some environments; 4s was causing false negatives.
        healthcheckTimeoutMs: 8000,
        paths: {
            settings: ".factory/settings.json"
        }
    },
    openclaw: {
        defaultCommand: "openclaw",
        envBinKey: "CLI_OPENCLAW_BIN",
        requiresBinary: true,
        // openclaw CLI may take >4s on cold start in containers.
        healthcheckTimeoutMs: 15000,
        paths: {
            settings: ".openclaw/openclaw.json"
        }
    },
    cursor: {
        defaultCommands: [
            "agent",
            "cursor"
        ],
        envBinKey: "CLI_CURSOR_BIN",
        requiresBinary: true,
        // Cursor startup can be slower on first run in containerized host-mount mode.
        healthcheckTimeoutMs: 15000,
        paths: {
            config: ".cursor/cli-config.json",
            auth: ".config/cursor/auth.json",
            state: ".cursor/agent-cli-state.json"
        }
    },
    windsurf: {
        defaultCommand: null,
        envBinKey: "CLI_WINDSURF_BIN",
        requiresBinary: false,
        healthcheckTimeoutMs: 4000,
        paths: {}
    },
    devin: {
        defaultCommand: "devin",
        envBinKey: "CLI_DEVIN_BIN",
        requiresBinary: true,
        // devin acp cold-start can take a few seconds on first run
        healthcheckTimeoutMs: 12000,
        paths: {
            // %APPDATA%\devin\config.json  (Windows)
            // ~/.config/devin/config.json  (Linux/macOS)
            get config () {
                return isWindows() ? __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.env.APPDATA || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir(), "AppData", "Roaming"), "devin", "config.json") : "TURBOPACK unreachable";
            }
        }
    },
    cline: {
        defaultCommand: "cline",
        envBinKey: "CLI_CLINE_BIN",
        requiresBinary: true,
        // Cline startup/version check can take >4s on some environments.
        healthcheckTimeoutMs: 12000,
        paths: {
            globalState: ".cline/data/globalState.json",
            secrets: "[REDIGIDO-PRESERVACAO]"
        }
    },
    kilo: {
        defaultCommand: "kilocode",
        envBinKey: "CLI_KILO_BIN",
        requiresBinary: true,
        // kilocode renders an ASCII logo banner on startup which can take >4s
        // on cold-start or low-resource environments (VPS, CI). Increase timeout
        // to avoid false healthcheck_failed results.
        healthcheckTimeoutMs: 15000,
        paths: {
            auth: ".local/share/kilo/auth.json"
        }
    },
    continue: {
        defaultCommand: "cn",
        envBinKey: "CLI_CONTINUE_BIN",
        requiresBinary: true,
        // opencode and continue may take up to 15s on first run / cold start on VPS
        healthcheckTimeoutMs: 15000,
        paths: {
            settings: ".continue/config.yaml"
        }
    },
    opencode: {
        defaultCommand: "opencode",
        envBinKey: "CLI_OPENCODE_BIN",
        requiresBinary: true,
        // opencode takes several seconds on cold start environments
        healthcheckTimeoutMs: 15000,
        paths: {
            config: ".config/opencode/opencode.json"
        }
    },
    hermes: {
        // Original / legacy simple Hermes entry (recovered from origin/main)
        defaultCommand: "hermes",
        envBinKey: "CLI_HERMES_BIN",
        requiresBinary: false,
        healthcheckTimeoutMs: 4000,
        paths: {
            config: ".config/hermes/config.json"
        }
    },
    "hermes-agent": {
        // Rich first-class support for the advanced Hermes Agent (multi-role: default, delegation, auxiliary.*)
        defaultCommand: "hermes",
        envBinKey: "CLI_HERMES_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 4000,
        paths: {
            // The relative path is kept for documentation purposes; getCliConfigPaths()
            // has a special case for hermes-agent that calls getHermesHome() instead of
            // getCliConfigHome(), so HERMES_HOME is always honoured (#3628).
            config: "config.yaml"
        }
    },
    amp: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntimeGrokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AMP_RUNTIME_ENTRY"],
    qoder: {
        defaultCommand: "qodercli",
        envBinKey: "CLI_QODER_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 12000,
        paths: {
            config: ".qoder/settings.json",
            auth: ".qoder/auth.json"
        }
    },
    qwen: {
        defaultCommand: "qwen",
        envBinKey: "CLI_QWEN_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 12000,
        paths: {
            settings: ".qwen/settings.json",
            env: ".qwen/.env"
        }
    },
    // ── Plan 14 — new "custom" configType tools ───────────────────────────────
    forge: {
        defaultCommand: "forge",
        envBinKey: "CLI_FORGE_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 8000,
        paths: {
            config: ".forge/config.toml"
        }
    },
    jcode: {
        defaultCommand: "jcode",
        envBinKey: "CLI_JCODE_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 8000,
        paths: {
            config: ".jcode/config.json"
        }
    },
    "grok-build": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntimeGrokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_RUNTIME_ENTRY"],
    "deepseek-tui": {
        defaultCommand: "deepseek-tui",
        envBinKey: "CLI_DEEPSEEK_TUI_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 8000,
        paths: {
            config: ".config/deepseek-tui/config.toml"
        }
    },
    omp: {
        defaultCommand: "omp",
        envBinKey: "CLI_OMP_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 8000,
        paths: {
            config: ".omp/agent/models.yml"
        }
    },
    letta: {
        defaultCommand: "letta",
        envBinKey: "CLI_LETTA_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 8000,
        paths: {
            config: ".letta/lc-local-backend/providers/auth.json"
        }
    },
    codewhale: {
        defaultCommand: "codewhale",
        envBinKey: "CLI_CODEWHALE_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 8000,
        paths: {
            config: ".codewhale/config.toml"
        }
    },
    smelt: {
        defaultCommand: "smelt",
        envBinKey: "CLI_SMELT_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 8000,
        paths: {
            config: ".smelt/config.json"
        }
    },
    pi: {
        defaultCommand: "pi",
        envBinKey: "CLI_PI_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 8000,
        paths: {
            config: ".pi/config.json"
        }
    },
    // Config path reconciled with bin/cli/commands/setup-crush.mjs::resolveCrushTarget's
    // default (~/.config/crush/crush.json) so the dashboard and `omniroute setup-crush`
    // agree on one canonical config location.
    crush: {
        defaultCommand: "crush",
        envBinKey: "CLI_CRUSH_BIN",
        requiresBinary: true,
        healthcheckTimeoutMs: 8000,
        paths: {
            config: ".config/crush/crush.json"
        }
    }
};
const isWindows = ()=>process.platform === "win32";
/**
 * (#510) Normalize MSYS2/Git-Bash style paths to Windows-native paths.
 * On Windows with Git Bash, 'where claude' may return '/c/Program Files/...'
 * instead of 'C:\\Program Files\\...'. Convert these so the path is usable
 * by Node's fs and child_process modules.
 */ const normalizeMsys2Path = (p)=>{
    if (!p || !isWindows()) return p;
    // Match /letter/rest-of-path — MSYS2 POSIX-style drive mount
    const msys2Match = p.match(/^\/([a-zA-Z])\/(.+)$/);
    if (msys2Match) {
        const drive = msys2Match[1].toUpperCase();
        const rest = msys2Match[2].replace(/\//g, "\\");
        return `${drive}:\\${rest}`;
    }
    return p;
};
const parseBoolean = (value, defaultValue = true)=>{
    if (value == null || value === "") return defaultValue;
    return !FALSE_VALUES.has(String(value).trim().toLowerCase());
};
const shouldUseShellForCommand = (command)=>{
    if (!isWindows()) //TURBOPACK unreachable
    ;
    // Windows npm CLI wrappers are usually .cmd/.bat files and require cmd.exe.
    // Direct executables should not go through the shell: absolute paths with spaces
    // (for example C:\Users\Name With Spaces\...\claude.exe) are split by cmd.exe.
    return /\.(?:cmd|bat)$/i.test(command);
};
const runProcess = (command, args, { env, timeoutMs = 3000, useShell = shouldUseShellForCommand(command) } = {})=>new Promise((resolve)=>{
        // Guard: reject commands with shell metacharacters — command comes from
        // server-controlled env vars/config, not HTTP input, but belt-and-suspenders.
        if (/[;&|`$<>\n\r]/.test(command)) {
            resolve({
                ok: false,
                stdout: "",
                stderr: "rejected: unsafe command path",
                exitCode: -1
            });
            return;
        }
        let stdout = "";
        let stderr = "";
        let timedOut = false;
        let settled = false;
        // Do NOT string-interpolate the path into a quoted shell command (hard rule
        // #13). When useShell is false (.exe and all non-Windows), spawn passes
        // `command` as a raw argv[0] and the OS loader handles spaces. When useShell
        // is true (.cmd/.bat on Windows), Node quotes the command for cmd.exe itself.
        const child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["spawn"])(command, args, {
            windowsHide: true,
            env,
            stdio: [
                "ignore",
                "pipe",
                "pipe"
            ],
            // On Windows, npm installs CLI wrappers as .cmd/.bat scripts. Those still
            // need cmd.exe, but direct .exe paths must avoid the shell so paths with
            // spaces are not split before execution.
            ...useShell ? {
                shell: true
            } : {}
        });
        const timer = setTimeout(()=>{
            timedOut = true;
            child.kill("SIGKILL");
        }, timeoutMs);
        const done = (result)=>{
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(result);
        };
        child.stdout.on("data", (chunk)=>{
            stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk)=>{
            stderr += chunk.toString();
        });
        child.on("error", (error)=>{
            done({
                ok: false,
                code: null,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                timedOut,
                error: error?.message || "spawn_error"
            });
        });
        child.on("close", (code)=>{
            done({
                ok: !timedOut && code === 0,
                code,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                timedOut,
                error: timedOut ? "timeout" : null
            });
        });
    });
const getRuntimeMode = ()=>{
    const mode = String(process.env.CLI_MODE || "auto").trim().toLowerCase();
    return VALID_RUNTIME_MODES.has(mode) ? mode : "auto";
};
/**
 * T12: Validate a CLI executable path to prevent shell injection.
 * Enforces: absolute path, no dangerous shell metacharacters, must exist and be a file.
 * Inspired by Antigravity Manager commit 96732c2 (Mar 11, 2026).
 */ const DANGEROUS_PATH_CHARS = [
    "&",
    "|",
    ";",
    "<",
    ">",
    "(",
    ")",
    "`",
    "$",
    "^",
    "%",
    "!"
];
/**
 * Check if a path is within a parent directory (case-insensitive, handles mixed separators).
 * Normalizes both paths to forward slashes before comparison to handle
 * inconsistent separator styles on Windows.
 */ const isPathWithin = (childPath, parentPath)=>{
    // Normalize to forward slashes for consistent comparison
    const normalize = (p)=>__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].normalize(p).toLowerCase().replace(/\\/g, "/");
    const normalizedChild = normalize(childPath);
    const normalizedParent = normalize(parentPath);
    if (normalizedChild === normalizedParent) return true;
    // Ensure parent ends with / for proper prefix matching
    const parentWithSep = normalizedParent.endsWith("/") ? normalizedParent : normalizedParent + "/";
    return normalizedChild.startsWith(parentWithSep);
};
const isSafePath = (execPath)=>{
    if (!execPath || !__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(execPath)) return false;
    if (DANGEROUS_PATH_CHARS.some((c)=>execPath.includes(c))) return false;
    // Allow path.sep and path.delimiter — no further character filtering needed
    return true;
};
/**
 * Validate that an environment variable value is a safe, absolute path
 * within acceptable directory trees. Rejects traversal, special chars,
 * and paths outside expected locations.
 */ const validateEnvPath = (value, allowedParents)=>{
    if (!value) return "";
    const trimmed = value.trim();
    // Reject if not absolute
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(trimmed)) return "";
    // Reject dangerous characters (same as isSafePath but applied to env vars)
    if (DANGEROUS_PATH_CHARS.some((c)=>trimmed.includes(c))) return "";
    // Reject if contains path traversal segments
    const normalized = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].normalize(trimmed);
    if (normalized.includes("..")) return "";
    // Reject if outside allowed parent directories
    if (allowedParents.length > 0) {
        const withinAllowed = allowedParents.some((parent)=>isPathWithin(normalized, parent));
        if (!withinAllowed) return "";
    }
    return normalized;
};
/**
 * Detect the npm global bin directory.
 * Cached on first call — `execFileSync` is expensive, only run once.
 */ let _npmGlobalPrefix;
const getNpmGlobalPrefix = ()=>{
    if (_npmGlobalPrefix !== undefined) return _npmGlobalPrefix;
    const envPrefix = String(process.env.npm_config_prefix || "").trim();
    if (envPrefix && __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(envPrefix)) {
        _npmGlobalPrefix = envPrefix;
        return _npmGlobalPrefix;
    }
    try {
        const result = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execFileSync"])("npm", [
            "config",
            "get",
            "prefix"
        ], {
            windowsHide: true,
            timeout: 5000,
            encoding: "utf8",
            stdio: [
                "ignore",
                "pipe",
                "ignore"
            ],
            ...isWindows() ? {
                shell: true
            } : "TURBOPACK unreachable"
        });
        const prefix = result.trim();
        if (prefix && __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(prefix) && !DANGEROUS_PATH_CHARS.some((c)=>prefix.includes(c))) {
            _npmGlobalPrefix = prefix;
            return _npmGlobalPrefix;
        }
    } catch  {}
    _npmGlobalPrefix = "";
    return _npmGlobalPrefix;
};
/**
 * Pre-compute expected parent directories at module startup for performance.
 * These are the allowed directories for CLI binary installation locations.
 */ const getExpectedParentPaths = ()=>{
    const home = __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir();
    const userProfile = process.env.USERPROFILE || home;
    const validatedAppData = validateEnvPath(process.env.APPDATA, [
        home,
        userProfile
    ]);
    const validatedLocalAppData = validateEnvPath(process.env.LOCALAPPDATA, [
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(home, "AppData", "Local"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(userProfile, "AppData", "Local"),
        userProfile
    ]);
    const validatedProgramFiles = validateEnvPath(process.env.ProgramFiles, [
        "C:\\Program Files",
        "C:\\Program Files (x86)"
    ]);
    const validatedProgramFilesX86 = validateEnvPath(process.env["ProgramFiles(x86)"], [
        "C:\\Program Files",
        "C:\\Program Files (x86)"
    ]);
    const npmPrefix = getNpmGlobalPrefix();
    // Add common user bin directories
    const userBinPaths = [
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(home, "bin"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(home, ".local", "bin")
    ];
    return [
        home,
        ...userBinPaths,
        userProfile,
        validatedAppData,
        validatedLocalAppData,
        validatedProgramFiles,
        validatedProgramFilesX86,
        npmPrefix
    ].filter(Boolean);
};
const getExtraPaths = ()=>String(process.env.CLI_EXTRA_PATHS || "").split(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].delimiter).map((segment)=>segment.trim()).filter(Boolean).filter((p)=>{
        // Must be absolute
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(p)) return false;
        // No dangerous characters
        if (DANGEROUS_PATH_CHARS.some((c)=>p.includes(c))) return false;
        // No path traversal
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].normalize(p).includes("..")) return false;
        return true;
    });
const getKnownToolPaths = (toolId)=>{
    const home = __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir();
    const paths = [];
    const npmPrefix = getNpmGlobalPrefix();
    const nvmNodePath = getNvmNodePath();
    const toolBins = {
        claude: [
            [
                "claude.cmd",
                "claude"
            ],
            [
                "claude.exe",
                "claude"
            ]
        ],
        codex: [
            [
                "codex.cmd",
                "codex"
            ]
        ],
        droid: [
            [
                "droid.cmd",
                "droid"
            ],
            [
                "droid.exe",
                "droid"
            ]
        ],
        openclaw: [
            [
                "openclaw.cmd",
                "openclaw"
            ]
        ],
        cursor: [
            [
                "agent.cmd",
                "agent"
            ],
            [
                "cursor.cmd",
                "cursor"
            ]
        ],
        cline: [
            [
                "cline.cmd",
                "cline"
            ]
        ],
        kilo: [
            [
                "kilocode.cmd",
                "kilocode"
            ]
        ],
        continue: [
            [
                "cn.cmd",
                "cn"
            ]
        ],
        opencode: [
            [
                "opencode.cmd",
                "opencode"
            ]
        ],
        qoder: [
            [
                "qodercli.cmd",
                "qodercli"
            ],
            [
                "qodercli.exe",
                "qodercli"
            ]
        ],
        qwen: [
            [
                "qwen.cmd",
                "qwen"
            ]
        ],
        devin: [
            [
                "devin.exe",
                "devin"
            ],
            [
                "devin.cmd",
                "devin"
            ]
        ]
    };
    const bins = toolBins[toolId] || [];
    if (isWindows()) {
        const userProfile = process.env.USERPROFILE || home;
        const appData = validateEnvPath(process.env.APPDATA, [
            home,
            userProfile
        ]);
        const localAppData = validateEnvPath(process.env.LOCALAPPDATA, [
            __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(home, "AppData", "Local"),
            __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(userProfile, "AppData", "Local"),
            userProfile
        ]);
        if (toolId === "claude") {
            paths.push(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(home, ".local", "bin", "claude.exe"));
            if (localAppData) {
                paths.push(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(localAppData, "Programs", "Claude", "claude.exe"));
                paths.push(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(localAppData, "claude-code", "claude.exe"));
                paths.push(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(localAppData, "Microsoft", "WinGet", "Packages", "Anthropic.ClaudeCode_Microsoft.Winget.Source_8wekyb3d8bbwe", "claude.exe"));
            }
        }
        if (toolId === "droid") {
            paths.push(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(home, "bin", "droid.exe"));
        }
        // Devin CLI installs to %LOCALAPPDATA%\devin\cli\bin\devin.exe
        if (toolId === "devin" && localAppData) {
            paths.push(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(localAppData, "devin", "cli", "bin", "devin.exe"));
        }
        for (const [winName] of bins){
            if (npmPrefix) paths.push(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(npmPrefix, winName));
            if (appData) {
                const appDataPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(appData, "npm", winName);
                if (!npmPrefix || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].normalize(appDataPath) !== __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].normalize(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(npmPrefix, winName))) {
                    paths.push(appDataPath);
                }
            }
            if (nvmNodePath) paths.push(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(nvmNodePath, winName));
        }
    } else //TURBOPACK unreachable
    ;
    return paths;
};
/**
 * Detect nvm-windows installation path dynamically from current Node.js executable.
 * Returns the directory containing node.exe if nvm is detected, null otherwise.
 */ const getNvmNodePath = ()=>{
    // Simple heuristic: if process.execPath includes "nvm", use its directory
    if (process.execPath.toLowerCase().includes("nvm")) {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(process.execPath);
    }
    return null;
};
const getLookupEnv = ()=>{
    const env = {
        ...process.env
    };
    const extraPaths = getExtraPaths();
    const basePath = env.PATH || env.Path || "";
    // #3321: on macOS GUI/Electron the inherited PATH is truncated (no Homebrew/nvm/volta),
    // so CLI detection and CLI spawns can't find tools the user actually has installed.
    // Enrich with the login-shell PATH (cached, darwin-only, fail-safe → null elsewhere).
    const loginShellPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$loginShellPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedLoginShellPath"])();
    const enrichedPath = loginShellPath ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$loginShellPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeShellPath"])(basePath, loginShellPath) : basePath;
    // Only add user-specified extra paths, NOT generic user directories
    // This is more secure - user explicitly opts in via CLI_EXTRA_PATHS
    if (extraPaths.length > 0 || enrichedPath !== basePath || isWindows()) {
        const mergedPath = [
            ...extraPaths,
            enrichedPath
        ].filter(Boolean).join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].delimiter);
        if (mergedPath) {
            env.PATH = mergedPath;
            if (isWindows()) {
                env.Path = mergedPath;
            }
        }
    }
    return env;
};
const resolveToolCommands = (toolId)=>{
    const tool = CLI_TOOLS[toolId];
    if (!tool) return [];
    const envCommand = String(process.env[tool.envBinKey] || "").trim();
    if (envCommand) return [
        envCommand
    ];
    if (Array.isArray(tool.defaultCommands) && tool.defaultCommands.length > 0) {
        return tool.defaultCommands.filter(Boolean);
    }
    return tool.defaultCommand ? [
        tool.defaultCommand
    ] : [];
};
const checkExplicitPath = async (commandPath)=>{
    // Reject paths that look like injection attempts
    if (!isSafePath(commandPath)) {
        return {
            installed: false,
            commandPath: null,
            reason: "unsafe_path"
        };
    }
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].access(commandPath, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].constants.F_OK);
    } catch  {
        return {
            installed: false,
            commandPath: null,
            reason: "not_found"
        };
    }
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].access(commandPath, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].constants.X_OK);
        return {
            installed: true,
            commandPath,
            reason: null
        };
    } catch  {
        return {
            installed: true,
            commandPath,
            reason: "not_executable"
        };
    }
};
const locateCommand = async (command, env)=>{
    if (!command) {
        return {
            installed: false,
            commandPath: null,
            reason: "missing_command"
        };
    }
    if (command.includes("/") || command.includes("\\")) {
        return checkExplicitPath(command);
    }
    if (isWindows()) {
        const located = await runProcess("where.exe", [
            command
        ], {
            env,
            timeoutMs: 3000,
            useShell: false
        });
        if (located.ok && located.stdout) {
            // `where` may return multiple matches (e.g. `opencode` + `opencode.cmd`).
            // npm global installs on Windows create both a Unix shell script (no extension)
            // and a .cmd wrapper. We must prefer the Windows executable extension.
            const lines = located.stdout.split(/\r?\n/).map((l)=>l.trim()).filter(Boolean);
            if (lines.length === 0) {
                return {
                    installed: false,
                    commandPath: null,
                    reason: "not_found"
                };
            }
            const winExt = /\.(cmd|exe|bat|com)$/i;
            const preferred = lines.find((l)=>winExt.test(l)) || lines[0];
            return {
                installed: true,
                commandPath: normalizeMsys2Path(preferred),
                reason: null
            };
        }
        return {
            installed: false,
            commandPath: null,
            reason: "not_found"
        };
    }
    //TURBOPACK unreachable
    ;
    const located = undefined;
};
const checkKnownPath = async (commandPath)=>{
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(commandPath)) {
        return {
            installed: false,
            commandPath: null,
            reason: "not_absolute"
        };
    }
    if (!isSafePath(commandPath)) {
        return {
            installed: false,
            commandPath: null,
            reason: "unsafe_path"
        };
    }
    try {
        // Resolve symlinks to get the real path and detect symlink escapes
        const realPath = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].realpath(commandPath);
        // Verify the resolved path — OR the original pre-resolution path — is within
        // expected directories. Use pre-computed expected parent paths (cached at module
        // startup for performance). On macOS temp directories often resolve from
        // /var -> /private/var, so compare both the configured parent and its canonical
        // realpath when available.
        //
        // #7753: also trust the pre-resolution `commandPath` itself, not just `realPath`
        // — see isLocationTrusted() in cliRuntimeKnownPath.ts for the rationale.
        const isWithinExpected = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntimeKnownPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLocationTrusted"])(commandPath, realPath, getExpectedParentPaths(), isPathWithin, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].realpath);
        if (!isWithinExpected) {
            return {
                installed: false,
                commandPath: null,
                reason: "symlink_escape"
            };
        }
        // Verify it's a regular file with reasonable size
        const stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(realPath);
        if (!stat.isFile()) {
            return {
                installed: false,
                commandPath: null,
                reason: "not_file"
            };
        }
        // CLI binaries should be > 30 bytes and < 350MB
        // npm .cmd wrappers on Windows are ~300-500 bytes, JS wrappers on Linux can be ~44 bytes
        // Minimum catches empty/suspicious files while allowing legitimate thin wrappers
        // Many modern CLIs (like Claude Code and OpenCode) build as single ~150-250MB binaries
        if (stat.size < 30 || stat.size > 350 * 1024 * 1024) {
            return {
                installed: false,
                commandPath: null,
                reason: "suspicious_size"
            };
        }
    } catch (error) {
        const errorCode = error.code;
        if (errorCode === "ENOENT") {
            return {
                installed: false,
                commandPath: null,
                reason: "not_found"
            };
        }
        if (errorCode === "EINVAL") {
            return {
                installed: false,
                commandPath: null,
                reason: "invalid_path"
            };
        }
        return {
            installed: false,
            commandPath: null,
            reason: "access_error"
        };
    }
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].access(commandPath, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].constants.X_OK);
        return {
            installed: true,
            commandPath,
            reason: null
        };
    } catch  {
        return {
            installed: true,
            commandPath,
            reason: "not_executable"
        };
    }
};
const locateCommandCandidate = async (commands, env, toolId)=>{
    if (!Array.isArray(commands) || commands.length === 0) {
        return {
            command: null,
            installed: false,
            commandPath: null,
            reason: "missing_command"
        };
    }
    // SECURITY: First check known installation paths for this specific tool
    // This avoids searching PATH and reduces attack surface
    let bestKnownPathFailure = null;
    if (toolId) {
        const { match, bestFailure } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntimeKnownPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findKnownPathMatch"])(getKnownToolPaths(toolId), checkKnownPath);
        if (match) {
            return {
                command: commands[0],
                installed: true,
                commandPath: match.commandPath,
                reason: match.reason
            };
        }
        bestKnownPathFailure = bestFailure;
    }
    // Always try PATH — a stray/broken known-path guess must never hide a genuinely
    // PATH-resolvable binary (#7774). User can also set CLI_EXTRA_PATHS if needed.
    for (const command of commands){
        const located = await locateCommand(command, env);
        if (located.installed || located.reason !== "not_found") {
            return {
                command,
                ...located
            };
        }
    }
    if (bestKnownPathFailure) {
        return {
            command: commands[0],
            ...bestKnownPathFailure
        };
    }
    return {
        command: commands[0],
        installed: false,
        commandPath: null,
        reason: "not_found"
    };
};
const checkRunnable = async (commandPath, env, timeoutMs = 4000)=>{
    // Minimal environment to prevent credential leakage to potentially malicious binaries
    const minimalEnv = {
        // #8036: merge in this Node's own bin dir so `#!/usr/bin/env node` npm CLIs
        // (e.g. codex) can resolve their interpreter under a minimal launcher PATH.
        PATH: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntimeHealthcheckPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildHealthcheckPath"])(env.PATH || env.Path || "", __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(process.execPath)),
        HOME: env.HOME || env.USERPROFILE,
        USERPROFILE: env.USERPROFILE,
        APPDATA: env.APPDATA,
        LOCALAPPDATA: env.LOCALAPPDATA,
        TEMP: env.TEMP,
        TMP: env.TMP,
        SystemRoot: env.SystemRoot,
        ComSpec: env.ComSpec,
        PATHEXT: env.PATHEXT
    };
    if (isWindows() && minimalEnv.PATH) {
        minimalEnv.Path = minimalEnv.PATH;
    }
    for (const args of [
        [
            "--version"
        ],
        [
            "-v"
        ]
    ]){
        const result = await runProcess(commandPath, args, {
            env: minimalEnv,
            timeoutMs
        });
        // Validate output: must be non-empty and reasonable length (< 4KB)
        if (result.ok && result.stdout.length > 0 && result.stdout.length < 4096) {
            return {
                runnable: true,
                reason: null,
                version: result.stdout.trim()
            };
        }
    }
    return {
        runnable: false,
        reason: "healthcheck_failed"
    };
};
const isCliConfigWriteAllowed = ()=>parseBoolean(process.env.CLI_ALLOW_CONFIG_WRITES, true);
const ensureCliConfigWriteAllowed = ()=>{
    if (isCliConfigWriteAllowed()) return null;
    return "CLI config writes are disabled (CLI_ALLOW_CONFIG_WRITES=false)";
};
const getCliConfigHome = ()=>{
    const override = String(process.env.CLI_CONFIG_HOME || "").trim();
    if (!override) return __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir();
    // Must be absolute
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(override)) return __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir();
    // Must not contain dangerous characters
    if (DANGEROUS_PATH_CHARS.some((c)=>override.includes(c))) return __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir();
    // Must not contain path traversal
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].normalize(override).includes("..")) return __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir();
    // Must be within user's home directory (prevent reading from system dirs)
    const home = __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir();
    const normalized = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].normalize(override);
    if (!isPathWithin(normalized, home)) {
        return home; // Silently fall back to home
    }
    return normalized;
};
const resolveOpencodeConfigDir = (_platform = process.platform, env = process.env, homeDir = __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir())=>{
    // #3330: OpenCode reads its config from XDG `~/.config/opencode/` on ALL
    // platforms — including Windows, where it uses `%USERPROFILE%\.config`, NOT
    // `%APPDATA%`. Writing to %APPDATA% on Windows put the file where OpenCode
    // never looks, so dashboard-saved config silently had no effect. `_platform`
    // is kept in the signature for call-site/test compatibility.
    const xdgConfigHome = String(env.XDG_CONFIG_HOME || "").trim();
    return xdgConfigHome || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(homeDir, ".config");
};
const resolveOpencodeConfigPath = (platform = process.platform, env = process.env, homeDir = __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir())=>__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(resolveOpencodeConfigDir(platform, env, homeDir), "opencode", "opencode.json");
const getOpenCodeConfigPath = ()=>resolveOpencodeConfigPath();
const getCliConfigPaths = (toolId)=>{
    const tool = CLI_TOOLS[toolId];
    if (!tool) return null;
    if (toolId === "opencode") {
        return {
            config: getOpenCodeConfigPath()
        };
    }
    // hermes-agent: honour HERMES_HOME env var instead of the generic CLI_CONFIG_HOME (#3628).
    if (toolId === "hermes-agent") {
        return {
            config: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cli$2d$helper$2f$config$2d$generator$2f$hermesHome$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHermesHome"])(), "config.yaml")
        };
    }
    const home = getCliConfigHome();
    return Object.fromEntries(Object.entries(tool.paths).map(([key, relativePath])=>{
        let resolvedPath = "";
        if (Array.isArray(relativePath)) {
            // Find the first path that exists, or default to the first one
            resolvedPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(home, relativePath[0]);
            for (const p of relativePath){
                const candidate = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(home, p);
                if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(candidate)) {
                    resolvedPath = candidate;
                    break;
                }
            }
        } else {
            resolvedPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(home, relativePath);
        }
        return [
            key,
            resolvedPath
        ];
    }));
};
const getCliPrimaryConfigPath = (toolId)=>{
    const paths = getCliConfigPaths(toolId);
    if (!paths) return null;
    const firstKey = Object.keys(paths)[0];
    return firstKey ? paths[firstKey] : null;
};
const getCliRuntimeStatus = async (toolId)=>{
    const tool = CLI_TOOLS[toolId];
    const runtimeMode = getRuntimeMode();
    if (!tool) {
        return {
            installed: false,
            runnable: false,
            command: null,
            commandPath: null,
            reason: "unknown_tool",
            runtimeMode,
            requiresBinary: false
        };
    }
    const env = getLookupEnv();
    const commands = resolveToolCommands(toolId);
    const requiresBinary = tool.requiresBinary !== false;
    if (!requiresBinary && commands.length === 0) {
        return {
            installed: true,
            runnable: true,
            command: null,
            commandPath: null,
            reason: "not_required",
            runtimeMode,
            requiresBinary
        };
    }
    const envCommand = String(process.env[tool.envBinKey] || "").trim();
    const hasEnvOverride = !!envCommand;
    const located = await locateCommandCandidate(commands, env, hasEnvOverride ? undefined : toolId);
    const command = located.command;
    if (!located.installed) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliInstallFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withSettingsFallback"])(getCliConfigPaths(toolId)?.settings, {
            installed: false,
            runnable: false,
            command,
            commandPath: null,
            reason: located.reason || "not_found",
            runtimeMode,
            requiresBinary
        });
    }
    if (located.reason === "not_executable") {
        return {
            installed: true,
            runnable: false,
            command,
            commandPath: located.commandPath,
            reason: "not_executable",
            runtimeMode,
            requiresBinary
        };
    }
    const healthcheck = await checkRunnable(located.commandPath || command || "", env, Number(tool.healthcheckTimeoutMs || 4000));
    return {
        installed: true,
        runnable: healthcheck.runnable,
        version: healthcheck.version,
        command,
        commandPath: located.commandPath,
        reason: healthcheck.reason,
        runtimeMode,
        requiresBinary
    };
};
const CLI_TOOL_IDS = Object.keys(CLI_TOOLS);
}),
"[project]/src/shared/utils/logRedaction.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "redactLogArgs",
    ()=>redactLogArgs,
    "redactSecrets",
    ()=>redactSecrets
]);
/**
 * Log redaction safety net (free-claude-code port, Fase 8.3).
 *
 * Final defense-in-depth layer: scrubs credentials that slip into log MESSAGES or
 * arbitrary object/error values, regardless of call site. It complements — does not
 * replace — the call-site maskers (`src/mitm/maskSecrets.ts`, `src/lib/logPayloads.ts`),
 * and runs in the pino `hooks.logMethod` (main thread, so it works with transports).
 *
 * Patterns are strictly bounded (single, non-overlapping character classes with `{n,}`
 * limits) to avoid catastrophic backtracking on untrusted input — see CLAUDE.md
 * "PII & Stream Sanitization Learnings" §1.
 */ const CENSOR = "[REDACTED]";
// Cheap pre-test: skip the (still bounded) replace work entirely for clean strings.
const SECRET_HINT = /bearer|telegram\.org\/bot|api[_-]?key|authorization|sk-/i;
const PATTERNS = [
    // Authorization: Bearer <token>  /  authorization=Bearer <token>
    [
        /(authorization\s*[:=]\s*bearer\s+)[\w.\-]{6,}/gi,
        `$1${CENSOR}`
    ],
    // bare "Bearer <token>"
    [
        /\bbearer\s+[\w.\-]{12,}/gi,
        `Bearer ${CENSOR}`
    ],
    // x-api-key: <val>  /  api_key=<val>
    [
        /((?:x-api-key|api[_-]?key)\s*[:=]\s*)[\w.\-]{6,}/gi,
        `$1${CENSOR}`
    ],
    // Telegram bot token in a URL: api.telegram.org/bot<digits>:<token>
    [
        /(api\.telegram\.org\/bot)\d{6,}:[\w\-]{20,}/gi,
        `$1${CENSOR}`
    ],
    // OpenAI-style keys: sk-... (also sk-proj-...)
    [
        /\bsk-[A-Za-z0-9_\-]{16,}/g,
        `sk-${CENSOR}`
    ]
];
const MAX_DEPTH = 6;
const MAX_NODES = 2000;
function redactSecrets(text) {
    if (typeof text !== "string" || text.length === 0 || !SECRET_HINT.test(text)) return text;
    let out = text;
    for (const [pattern, replacement] of PATTERNS){
        out = out.replace(pattern, replacement);
    }
    return out;
}
function redactValue(value, depth, state) {
    if (state.budget <= 0 || depth > MAX_DEPTH) return value;
    state.budget -= 1;
    if (typeof value === "string") return redactSecrets(value);
    if (value === null || typeof value !== "object") return value;
    if (state.seen.has(value)) return value; // circular guard
    state.seen.add(value);
    if (value instanceof Error) {
        const message = redactSecrets(value.message || "");
        const stack = redactSecrets(value.stack || "");
        // Untouched error → keep the original instance so pino's err serializer still runs.
        if (message === (value.message || "") && stack === (value.stack || "")) return value;
        // Return a redacted CLONE (not the original — it may be used elsewhere) that is still
        // a real Error, so pino's err serializer produces the usual {type, message, stack}.
        const cloned = new Error(message);
        cloned.name = value.name;
        cloned.stack = stack;
        return cloned;
    }
    if (Array.isArray(value)) {
        let changed = false;
        const out = value.map((item)=>{
            const redacted = redactValue(item, depth + 1, state);
            if (redacted !== item) changed = true;
            return redacted;
        });
        return changed ? out : value;
    }
    let changed = false;
    const out = {};
    for (const key of Object.keys(value)){
        const original = value[key];
        const redacted = redactValue(original, depth + 1, state);
        if (redacted !== original) changed = true;
        out[key] = redacted;
    }
    return changed ? out : value;
}
function redactLogArgs(args) {
    if (!Array.isArray(args) || args.length === 0) return args;
    const state = {
        budget: MAX_NODES,
        seen: new WeakSet()
    };
    let changed = false;
    const out = args.map((arg)=>{
        const redacted = redactValue(arg, 0, state);
        if (redacted !== arg) changed = true;
        return redacted;
    });
    return changed ? out : args;
}
}),
"[project]/src/shared/utils/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createLogger",
    ()=>createLogger,
    "logger",
    ()=>logger
]);
/**
 * Structured Logger — Pino-based logger for OmniRoute
 *
 * Usage:
 *   import { logger } from "@/shared/utils/logger";
 *   const log = logger.child({ module: "proxy" });
 *   log.info({ model: "gpt-4o" }, "Request received");
 *   log.error({ err }, "Connection failed");
 *
 * In development, output is pretty-printed via pino-pretty.
 * In production, output is structured JSON for log aggregation.
 *
 * When APP_LOG_TO_FILE is enabled (default: true), logs are also written
 * as JSON lines to the file specified by APP_LOG_FILE_PATH.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__ = __turbopack_context__.i("[externals]/pino [external] (pino, cjs, [project]/node_modules/pino)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logRotation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logRotation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logRedaction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logRedaction.ts [app-route] (ecmascript)");
;
;
;
;
;
const isDev = ("TURBOPACK compile-time value", "development") !== "production";
const baseConfig = {
    level: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppLogLevel"])(("TURBOPACK compile-time truthy", 1) ? "debug" : "TURBOPACK unreachable"),
    base: {
        service: "omniroute"
    },
    timestamp: __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"].stdTimeFunctions.isoTime,
    formatters: {
        level (label) {
            return {
                level: label
            };
        }
    },
    // Final defense-in-depth redaction net: runs in the main thread (transport-safe) and
    // scrubs credentials that slip into any log message/object/error. See logRedaction.ts.
    hooks: {
        logMethod (inputArgs, method) {
            return method.apply(this, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logRedaction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redactLogArgs"])(inputArgs));
        }
    }
};
function getTransportCompatibleConfig() {
    const { formatters, ...rest } = baseConfig;
    if (!formatters) return rest;
    const { level: _levelFormatter, ...safeFormatters } = formatters;
    return Object.keys(safeFormatters).length > 0 ? {
        ...rest,
        formatters: safeFormatters
    } : rest;
}
/**
 * Build a `pino.transport()` worker-thread stream and attach an `error` listener
 * BEFORE handing it to `pino()`.
 *
 * `pino({ transport: {...} })` builds the same stream internally but never listens
 * for its `error` event. A destination that stops existing mid-run (its directory is
 * deleted — e.g. a test's tmp `DATA_DIR` removed in `after()`, or an operator wiping
 * `logs/`) makes the worker's write fail with `ENOENT`; that surfaces as an unlistened
 * `error` event on the main-thread stream, which Node re-throws as an uncaught
 * exception (issue #6360 — "resource generated asynchronous activity after the test
 * ended"). A logger must never crash its host process because its own log file
 * vanished, so failed writes are dropped (best-effort stderr notice) instead of
 * escalating.
 */ function buildFileTransportStream(targets) {
    const stream = __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"].transport({
        targets
    });
    stream.on("error", (err)=>{
        try {
            process.stderr.write(`[logger] log transport write failed, dropping log line: ${err?.message || err}\n`);
        } catch  {
        // Nothing more we can do — never let a logging failure crash the process.
        }
    });
    return stream;
}
/**
 * Build the logger with optional file transport.
 * Uses pino transport targets for all destinations.
 */ function buildLogger() {
    const logConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logRotation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLogConfig"])();
    const logLevel = baseConfig.level || "info";
    const transportConfig = getTransportCompatibleConfig();
    // If file logging is enabled, set up dual transport (stdout + file)
    if (logConfig.logToFile) {
        try {
            // Initialize log directory and rotation
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logRotation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initLogRotation"])();
            // Resolve to absolute path for pino worker threads
            const absLogPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(logConfig.logFilePath);
            if ("TURBOPACK compile-time truthy", 1) {
                // Dev: pino-pretty → stdout, JSON → file
                const stream = buildFileTransportStream([
                    {
                        target: "pino-pretty",
                        options: {
                            colorize: true,
                            translateTime: "HH:MM:ss.l",
                            ignore: "pid,hostname,service",
                            messageFormat: "[{module}] {msg}",
                            destination: 1
                        },
                        level: logLevel
                    },
                    {
                        target: "pino/file",
                        options: {
                            destination: absLogPath,
                            mkdir: true
                        },
                        level: logLevel
                    }
                ]);
                return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"])(transportConfig, stream);
            }
            //TURBOPACK unreachable
            ;
        } catch (err) {
            // Log the actual error for diagnostics (issue #165)
            try {
                process.stderr.write(`[logger] Failed to set up file transport, attempting sync fallback: ${err?.message || err}\n`);
            } catch  {}
            // Fallback: use sync pino.destination() instead of worker-thread transport
            // pino.transport() uses worker threads which can fail in Next.js production bundles
            try {
                const absLogPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(logConfig.logFilePath);
                const fileDestination = __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"].destination({
                    dest: absLogPath,
                    mkdir: true,
                    sync: true
                });
                fileDestination.on("error", (err)=>{
                    try {
                        process.stderr.write(`[logger] sync log destination write failed, dropping log line: ${err?.message || err}\n`);
                    } catch  {
                    // Nothing more we can do — never let a logging failure crash the process.
                    }
                });
                // Production fallback: JSON to both stdout and file via multistream
                return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"])(baseConfig, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"].multistream([
                    {
                        stream: process.stdout,
                        level: logLevel
                    },
                    {
                        stream: fileDestination,
                        level: logLevel
                    }
                ]));
            } catch (fallbackErr) {
                try {
                    process.stderr.write(`[logger] Sync fallback also failed, falling back to console only: ${fallbackErr?.message || fallbackErr}\n`);
                } catch  {}
            }
        }
    }
    // Console-only (no file logging)
    if ("TURBOPACK compile-time truthy", 1) {
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"])({
            ...baseConfig,
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "HH:MM:ss.l",
                    ignore: "pid,hostname,service",
                    messageFormat: "[{module}] {msg}"
                }
            }
        });
    }
    //TURBOPACK unreachable
    ;
}
const logger = buildLogger();
function createLogger(module) {
    return logger.child({
        module
    });
}
}),
"[project]/src/shared/utils/noAuthProviders.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const noAuthProviderEntries = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"]);
function normalizeBlockedProviderSet(blockedProviders) {
    const entries = blockedProviders instanceof Set ? Array.from(blockedProviders) : blockedProviders;
    return new Set(Array.isArray(entries) ? entries.filter((provider)=>typeof provider === "string" && provider.length > 0) : []);
}
function isProviderBlockedByIdOrAlias(providerId, blockedProviders) {
    const blockedProviderSet = normalizeBlockedProviderSet(blockedProviders);
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderById"])(providerId);
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
"[project]/src/shared/utils/secureRandom.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_setSecureRandomFloatSource",
    ()=>_setSecureRandomFloatSource,
    "secureRandomFloat",
    ()=>secureRandomFloat,
    "secureRandomInt",
    ()=>secureRandomInt
]);
/**
 * Cryptographically-secure RNG helpers for load-balancing / routing selection.
 *
 * OmniRoute's combo target selection (weighted / random / power-of-two-choices), the
 * credential-deck rotation, and shadow-routing sampling pick among upstream
 * providers/connections. CodeQL's `js/insecure-randomness` flags `Math.random()` in these
 * paths as "randomness in a security context" — a false positive (provider load-balancing
 * is not a secret, token, nonce or session id). Routing these few, non-hot-path selections
 * through `node:crypto` removes the finding at negligible cost. These are drop-in
 * replacements with identical ranges and semantics:
 *
 *   secureRandomInt(n)   === Math.floor(Math.random() * n)   // integer in [0, n)
 *   secureRandomFloat()  === Math.random()                   // float   in [0, 1)
 *
 * The integer helper uses `crypto.randomInt` (unbiased rejection sampling) rather than
 * `Math.floor(cryptoFloat() * n)` — dividing/rounding a crypto value introduces modulo bias
 * (CodeQL `js/biased-cryptographic-random`).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
/** Default source: uniform float in [0, 1) from 48 bits of crypto entropy. */ function cryptoRandomFloat() {
    const buf = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(6);
    let value = 0;
    for(let i = 0; i < buf.length; i++){
        value = value * 256 + buf[i];
    }
    return value / 2 ** 48;
}
// Test-only deterministic float source — `null` in production (the crypto sources above are
// used directly). Tests inject a fixed sequence via _setSecureRandomFloatSource (mirrors the
// `_resetAllDecks` test-only export). When injected, secureRandomInt derives the index from
// the same float so the deterministic selection tests keep identical assertions; production
// never takes that path, so no crypto value is divided/rounded into a biased integer.
let testFloatSource = null;
function secureRandomFloat() {
    return testFloatSource ? testFloatSource() : cryptoRandomFloat();
}
function secureRandomInt(maxExclusive) {
    if (!Number.isFinite(maxExclusive) || maxExclusive <= 1) return 0;
    const max = Math.floor(maxExclusive);
    if (testFloatSource) {
        // Deterministic test path — clamp defends the probability-0 case of a source returning ~1.
        return Math.min(max - 1, Math.floor(testFloatSource() * max));
    }
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomInt"])(max);
}
function _setSecureRandomFloatSource(source) {
    testFloatSource = source ?? null;
}
}),
"[project]/src/shared/utils/shuffleDeck.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_resetAllDecks",
    ()=>_resetAllDecks,
    "fisherYatesShuffle",
    ()=>fisherYatesShuffle,
    "getNextFromDeck",
    ()=>getNextFromDeck,
    "getNextFromDeckSync",
    ()=>getNextFromDeckSync
]);
/**
 * Shared shuffle deck utility — Fisher-Yates shuffle with anti-repeat guarantee.
 * Used by both combo model rotation and credential connection selection.
 *
 * Thread-safe: each deck namespace gets its own promise-based mutex to prevent
 * race conditions when concurrent requests hit the same deck simultaneously.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/secureRandom.ts [app-route] (ecmascript)");
;
// ─── State ──────────────────────────────────────────────────────────────────
const decks = new Map();
const mutexes = new Map();
function fisherYatesShuffle(arr) {
    const result = [
        ...arr
    ];
    for(let i = result.length - 1; i > 0; i--){
        const j = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["secureRandomInt"])(i + 1);
        const tmp = result[i];
        result[i] = result[j];
        result[j] = tmp;
    }
    return result;
}
async function getNextFromDeck(namespace, itemIds) {
    if (itemIds.length === 0) return "";
    if (itemIds.length === 1) return itemIds[0];
    // Acquire per-namespace mutex
    const currentMutex = mutexes.get(namespace) ?? Promise.resolve();
    let resolveMutex;
    mutexes.set(namespace, new Promise((resolve)=>{
        resolveMutex = resolve;
    }));
    try {
        await currentMutex;
        const idsKey = [
            ...itemIds
        ].sort().join(",");
        const existing = decks.get(namespace);
        // If deck exists, same item set, and not exhausted — advance
        if (existing && existing.idsKey === idsKey && existing.index < existing.order.length) {
            const id = existing.order[existing.index];
            decks.set(namespace, {
                ...existing,
                index: existing.index + 1
            });
            return id;
        }
        // Reshuffle — ensure last of previous cycle is not first of new cycle
        const lastUsedId = existing && existing.idsKey === idsKey && existing.order.length > 0 ? existing.order[existing.order.length - 1] : undefined;
        const newOrder = fisherYatesShuffle(itemIds);
        if (lastUsedId !== undefined && newOrder[0] === lastUsedId && newOrder.length > 1) {
            const swapIdx = 1 + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["secureRandomInt"])(newOrder.length - 1);
            const tmp = newOrder[0];
            newOrder[0] = newOrder[swapIdx];
            newOrder[swapIdx] = tmp;
        }
        decks.set(namespace, {
            order: newOrder,
            index: 1,
            idsKey
        });
        return newOrder[0];
    } finally{
        resolveMutex?.();
    }
}
function getNextFromDeckSync(namespace, itemIds) {
    if (itemIds.length === 0) return "";
    if (itemIds.length === 1) return itemIds[0];
    const idsKey = [
        ...itemIds
    ].sort().join(",");
    const existing = decks.get(namespace);
    if (existing && existing.idsKey === idsKey && existing.index < existing.order.length) {
        const id = existing.order[existing.index];
        decks.set(namespace, {
            ...existing,
            index: existing.index + 1
        });
        return id;
    }
    const lastUsedId = existing && existing.idsKey === idsKey && existing.order.length > 0 ? existing.order[existing.order.length - 1] : undefined;
    const newOrder = fisherYatesShuffle(itemIds);
    if (lastUsedId !== undefined && newOrder[0] === lastUsedId && newOrder.length > 1) {
        const swapIdx = 1 + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["secureRandomInt"])(newOrder.length - 1);
        const tmp = newOrder[0];
        newOrder[0] = newOrder[swapIdx];
        newOrder[swapIdx] = tmp;
    }
    decks.set(namespace, {
        order: newOrder,
        index: 1,
        idsKey
    });
    return newOrder[0];
}
function _resetAllDecks() {
    decks.clear();
    mutexes.clear();
}
}),
"[project]/src/shared/utils/apiAuth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "isAuthRequired",
    ()=>isAuthRequired,
    "isAuthenticated",
    ()=>isAuthenticated,
    "isDashboardSessionAuthenticated",
    ()=>isDashboardSessionAuthenticated,
    "isLoopbackRequest",
    ()=>isLoopbackRequest,
    "isManagementApiRequest",
    ()=>isManagementApiRequest,
    "isPublicRoute",
    ()=>isPublicRoute,
    "verifyAuth",
    ()=>verifyAuth
]);
/**
 * API Authentication Guard — Shared utility for protecting API routes.
 *
 * Management APIs require a dashboard session, while client-facing APIs may still
 * accept Bearer API keys. Route scope is inferred from the request pathname.
 *
 * @module shared/utils/apiAuth
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$publicApiRoutes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/publicApiRoutes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const LOOPBACK_HOSTNAMES = new Set([
    "localhost",
    "::1"
]);
function hasConfiguredPassword(settings) {
    return typeof settings.password === "string" && settings.password.length > 0;
}
function hasConfiguredOidc(settings) {
    return settings.oidcEnabled === true && typeof settings.oidcIssuer === "string" && settings.oidcIssuer.trim().length > 0 && typeof settings.oidcClientId === "string" && settings.oidcClientId.trim().length > 0 && typeof settings.oidcClientSecret === "string" && settings.oidcClientSecret.trim().length > 0;
}
function getRequestPathname(request) {
    const nextPathname = request && typeof request === "object" && "nextUrl" in request && request.nextUrl && typeof request.nextUrl.pathname === "string" ? request.nextUrl.pathname : null;
    if (nextPathname) return nextPathname;
    const rawUrl = request && typeof request === "object" && "url" in request && typeof request.url === "string" ? request.url : "";
    if (!rawUrl) return null;
    try {
        return new URL(rawUrl, "http://localhost").pathname;
    } catch  {
        return null;
    }
}
function isOnboardingBootstrapPath(pathname) {
    return pathname === "/dashboard/onboarding";
}
function isRequireLoginBootstrapWritePath(pathname, method) {
    return pathname === "/api/settings/require-login" && method.toUpperCase() === "POST";
}
function getRequestMethod(request) {
    if (request && typeof request === "object" && "method" in request && typeof request.method === "string") {
        return request.method.toUpperCase();
    }
    return "GET";
}
function getRequestHostname(request) {
    const nextHostname = request && typeof request === "object" && "nextUrl" in request && request.nextUrl && typeof request.nextUrl.hostname === "string" ? request.nextUrl.hostname : null;
    if (nextHostname) return nextHostname;
    const rawUrl = request && typeof request === "object" && "url" in request && typeof request.url === "string" ? request.url : "";
    if (rawUrl) {
        try {
            return new URL(rawUrl, "http://localhost").hostname;
        } catch  {
        // Fall through to Host header parsing.
        }
    }
    const requestHeaders = request && typeof request === "object" && "headers" in request ? request.headers : undefined;
    const host = requestHeaders?.get("host") || requestHeaders?.get("Host") || null;
    if (!host) return null;
    try {
        return new URL(`http://${host}`).hostname;
    } catch  {
        return host.split(":")[0] || null;
    }
}
function isLoopbackRequest(request) {
    const hostname = getRequestHostname(request);
    if (!hostname) return false;
    const normalized = hostname.trim().toLowerCase().replace(/^\[(.*)\]$/, "$1");
    if (LOOPBACK_HOSTNAMES.has(normalized)) return true;
    if (/^127(?:\.\d{1,3}){3}$/.test(normalized)) return true;
    return false;
}
function getCookieValueFromHeader(headers, name) {
    const cookieHeader = headers?.get("cookie") || headers?.get("Cookie");
    if (!cookieHeader) return null;
    for (const segment of cookieHeader.split(";")){
        const [rawKey, ...rawValue] = segment.split("=");
        if (!rawKey || rawValue.length === 0) continue;
        if (rawKey.trim() !== name) continue;
        return rawValue.join("=").trim();
    }
    return null;
}
function getRequestApiKey(request, opts) {
    if (!request || typeof request !== "object") return null;
    const headers = "headers" in request ? request.headers : undefined;
    const rawUrl = "url" in request && typeof request.url === "string" ? request.url : null;
    const pathname = getRequestPathname(request);
    const syntheticUrl = rawUrl || (pathname ? `http://localhost${pathname}` : null);
    // Management auth never honours a URL-borne credential (defence-in-depth: the
    // path-scoped token is a client-API affordance only — a credential in the URL
    // must not authenticate a management route). See the #3300 security follow-up.
    const allowUrl = opts?.allowUrl !== false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])({
        headers,
        url: allowUrl ? syntheticUrl : null
    }, {
        allowUrl
    });
}
async function validateBearerApiKey(apiKey) {
    if (!apiKey) return false;
    try {
        const { validateApiKey } = await __turbopack_context__.A("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript, async loader)");
        return await validateApiKey(apiKey);
    } catch  {
        return false;
    }
}
/**
 * Check whether a Bearer API key is valid AND carries a scope that authorizes
 * it on management API routes (`/api/*` excluding `/api/v1/*` and the public
 * allowlist). Returns `false` for unscoped keys so that the existing
 * default-deny posture on management routes is preserved.
 *
 * Scope set is sourced from `@/shared/constants/managementScopes` so this
 * helper stays in lockstep with `requireManagementAuth.hasManageScope`.
 */ async function validateBearerApiKeyForManagement(apiKey) {
    if (!apiKey) return false;
    try {
        const [{ validateApiKey, getApiKeyMetadata }, { hasManageScope }] = await Promise.all([
            __turbopack_context__.A("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript, async loader)"),
            __turbopack_context__.A("[project]/src/shared/constants/managementScopes.ts [app-route] (ecmascript, async loader)")
        ]);
        const valid = await validateApiKey(apiKey);
        if (!valid) return false;
        const metadata = await getApiKeyMetadata(apiKey);
        if (!metadata) return false;
        return hasManageScope(metadata.scopes);
    } catch  {
        return false;
    }
}
function isManagementApiRequest(request) {
    const pathname = getRequestPathname(request);
    if (!pathname?.startsWith("/api/")) return false;
    if (pathname.startsWith("/api/v1/")) return false;
    return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$publicApiRoutes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPublicApiRoute"])(pathname, getRequestMethod(request));
}
async function isDashboardSessionAuthenticated(request) {
    if (!process.env.JWT_SECRET) return false;
    let token = request && typeof request === "object" && "cookies" in request && request.cookies?.get?.("auth_token")?.value ? request.cookies.get("auth_token")?.value || null : null;
    const requestHeaders = request && typeof request === "object" && "headers" in request ? request.headers : undefined;
    if (!token) {
        token = getCookieValueFromHeader(requestHeaders, "auth_token");
    }
    if (!token) {
        try {
            const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
            token = cookieStore.get("auth_token")?.value || null;
        } catch  {
            token = null;
        }
    }
    if (!token) return false;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, secret);
        return true;
    } catch  {
        return false;
    }
}
async function verifyAuth(request) {
    if (await isDashboardSessionAuthenticated(request)) {
        return null;
    }
    const isManagement = isManagementApiRequest(request);
    const apiKey = getRequestApiKey(request, {
        allowUrl: !isManagement
    });
    if (isManagement) {
        if (await validateBearerApiKeyForManagement(apiKey)) {
            return null;
        }
        return apiKey ? "Invalid management token" : "Authentication required";
    }
    if (await validateBearerApiKey(apiKey)) {
        return null;
    }
    return "Authentication required";
}
async function isAuthenticated(request) {
    // If settings say login/auth is disabled, treat all requests as authenticated
    if (!await isAuthRequired(request)) {
        return true;
    }
    if (await isDashboardSessionAuthenticated(request)) {
        return true;
    }
    const isManagement = isManagementApiRequest(request);
    const apiKey = getRequestApiKey(request, {
        allowUrl: !isManagement
    });
    if (isManagement) {
        return validateBearerApiKeyForManagement(apiKey);
    }
    return validateBearerApiKey(apiKey);
}
function isPublicRoute(pathname, method = "GET") {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$publicApiRoutes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPublicApiRoute"])(pathname, method);
}
async function isAuthRequired(request) {
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        if (settings.requireLogin === false) return false;
        if (!hasConfiguredPassword(settings) && !hasConfiguredOidc(settings) && !process.env.INITIAL_PASSWORD) {
            if (!request) return false;
            const pathname = getRequestPathname(request);
            const method = getRequestMethod(request);
            if (isOnboardingBootstrapPath(pathname)) {
                return false;
            }
            if (pathname && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$publicApiRoutes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPublicApiRoute"])(pathname, method)) {
                return false;
            }
            if (isRequireLoginBootstrapWritePath(pathname, method)) {
                return false;
            }
            return settings.setupComplete === true || !isLoopbackRequest(request);
        }
        return true;
    } catch (error) {
        // On error, require auth (secure by default)
        // Log the error so failures (e.g., SQLITE_BUSY) aren't silent 401s
        console.error("[API_AUTH_GUARD] isAuthRequired failed, defaulting to true:", error?.message || error);
        return true;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/shared/constants/managementScopes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Management API key scopes — the set of API key scopes that authorize a
 * Bearer key on management routes (`/api/*` excluding `/api/v1/*` and the
 * public allowlist).
 *
 * Single source of truth shared by:
 *   - `src/lib/api/requireManagementAuth.ts` (`hasManageScope`)
 *   - `src/shared/utils/apiAuth.ts` (`validateBearerApiKeyForManagement`)
 *
 * Keep both helpers in sync by importing `MANAGEMENT_API_KEY_SCOPES` from
 * here — never re-declare the list inline.
 */ /** Canonical scope name granted to the default environment key. */ __turbopack_context__.s([
    "MANAGEMENT_API_KEY_SCOPES",
    ()=>MANAGEMENT_API_KEY_SCOPES,
    "MANAGE_SCOPE",
    ()=>MANAGE_SCOPE,
    "MCP_CONNECT_SCOPE",
    ()=>MCP_CONNECT_SCOPE,
    "hasManageScope",
    ()=>hasManageScope,
    "hasMcpConnectOrManageScope",
    ()=>hasMcpConnectOrManageScope
]);
const MANAGE_SCOPE = "manage";
const MANAGEMENT_API_KEY_SCOPES = new Set([
    "manage",
    "admin"
]);
const MCP_CONNECT_SCOPE = "mcp:connect";
function hasMcpConnectOrManageScope(scopes = []) {
    if (hasManageScope(scopes)) return true;
    return scopes.includes(MCP_CONNECT_SCOPE);
}
function hasManageScope(scopes = []) {
    for (const scope of scopes){
        if (MANAGEMENT_API_KEY_SCOPES.has(scope)) return true;
    }
    return false;
}
}),
];

//# sourceMappingURL=src_shared_15-plvh._.js.map