module.exports = [
"[project]/src/lib/oauth/credentialBlob.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Paste-safe credential blob codec for the remote OAuth login helper.
 *
 * Why this exists: Google's `firstparty/nativeapp` consent for embedded desktop
 * clients (Antigravity/agy) only releases the authorization code when the
 * loopback redirect (127.0.0.1:<port>) is reachable. On a remote VPS install the
 * loopback is unreachable, so the consent hangs and never emits a code — there is
 * nothing for the user to paste back. (The same flow works locally and over an SSH
 * tunnel because then the loopback IS reachable.)
 *
 * The workaround: a local helper (`omniroute login antigravity`) runs the OAuth on
 * the user's own machine (loopback reachable → consent completes → tokens), then
 * encodes the raw token response into a single-line blob with this codec. The user
 * pastes the blob into the remote dashboard, which decodes it and persists the
 * connection (running the provider's post-exchange/onboarding from the server,
 * which CAN reach Google's Cloud Code APIs).
 *
 * Format: `<prefix><base64url(JSON)>` — a recognizable prefix so humans and the
 * decoder can identify it, followed by a URL/shell-safe base64url payload (no
 * `+`, `/`, `=`, or whitespace) so it survives copy-paste through terminals.
 */ /** Human-recognizable, copy-paste-safe prefix. The decoder requires it. */ __turbopack_context__.s([
    "CREDENTIAL_BLOB_PREFIX",
    ()=>CREDENTIAL_BLOB_PREFIX,
    "decodeCredentialBlob",
    ()=>decodeCredentialBlob,
    "encodeCredentialBlob",
    ()=>encodeCredentialBlob
]);
const CREDENTIAL_BLOB_PREFIX = "omniroute-cred-v1.";
/** Current blob schema version (embedded in the payload as `v`). */ const CREDENTIAL_BLOB_VERSION = 1;
function encodeCredentialBlob(input) {
    if (!input || typeof input.provider !== "string" || !input.provider.trim()) {
        throw new Error("encodeCredentialBlob: a non-empty provider is required");
    }
    if (!input.tokens || typeof input.tokens !== "object") {
        throw new Error("encodeCredentialBlob: tokens object is required");
    }
    const payload = {
        v: CREDENTIAL_BLOB_VERSION,
        provider: input.provider.trim(),
        tokens: input.tokens
    };
    const json = JSON.stringify(payload);
    const b64 = Buffer.from(json, "utf8").toString("base64url");
    return `${CREDENTIAL_BLOB_PREFIX}${b64}`;
}
function decodeCredentialBlob(blob) {
    if (typeof blob !== "string" || !blob.startsWith(CREDENTIAL_BLOB_PREFIX)) {
        throw new Error(`decodeCredentialBlob: invalid format — must start with "${CREDENTIAL_BLOB_PREFIX}"`);
    }
    const b64 = blob.slice(CREDENTIAL_BLOB_PREFIX.length).trim();
    if (!/^[A-Za-z0-9_-]+$/.test(b64)) {
        throw new Error("decodeCredentialBlob: invalid payload — not base64url");
    }
    let parsed;
    try {
        const json = Buffer.from(b64, "base64url").toString("utf8");
        parsed = JSON.parse(json);
    } catch  {
        throw new Error("decodeCredentialBlob: invalid payload — could not parse JSON");
    }
    if (parsed.v !== CREDENTIAL_BLOB_VERSION) {
        throw new Error(`decodeCredentialBlob: unsupported blob version ${String(parsed.v)} (expected ${CREDENTIAL_BLOB_VERSION})`);
    }
    if (typeof parsed.provider !== "string" || !parsed.provider.trim()) {
        throw new Error("decodeCredentialBlob: invalid payload — missing provider");
    }
    const tokens = parsed.tokens;
    if (!tokens || typeof tokens !== "object") {
        throw new Error("decodeCredentialBlob: invalid payload — missing tokens");
    }
    if (typeof tokens.access_token !== "string" || !tokens.access_token) {
        throw new Error("decodeCredentialBlob: invalid payload — missing access_token");
    }
    return {
        provider: parsed.provider.trim(),
        tokens
    };
}
}),
"[project]/src/lib/oauth/services/codexImport.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeJwtExp",
    ()=>decodeJwtExp,
    "extractCodexAccountInfo",
    ()=>extractCodexAccountInfo,
    "flattenCodexImportPayload",
    ()=>flattenCodexImportPayload,
    "normalizeCodexImportRecord",
    ()=>normalizeCodexImportRecord
]);
/**
 * Codex (OpenAI) bulk-import normalization
 *
 * Accepts the JSON shape produced by Codex CLI / common token-export tools and
 * returns a {@link createProviderConnection} payload (or a typed error).
 *
 * Pure: no I/O, no network. Safe to unit-test.
 *
 * Ported from decolua/9router#1257 (beaaan).
 */ const REQUIRED_FIELDS = [
    "access_token",
    "refresh_token"
];
/** 10 days — the typical OpenAI access-token lifetime when no `expired` is supplied. */ const DEFAULT_EXPIRY_MS = 10 * 24 * 60 * 60 * 1000;
const BASE64_BLOCK_SIZE = 4;
// ── Internal helpers ──────────────────────────────────────────────────────────
/**
 * Decode a JWT payload to a plain object (no signature verification).
 *
 * Mirrors the helper in `providers.ts` but is kept local so this module has no
 * runtime dependency on the larger OAuth module graph.
 */ function decodeJwtPayload(jwt) {
    try {
        if (!jwt || typeof jwt !== "string") return null;
        const parts = jwt.split(".");
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const missingPadding = (BASE64_BLOCK_SIZE - base64.length % BASE64_BLOCK_SIZE) % BASE64_BLOCK_SIZE;
        const padded = base64 + "=".repeat(missingPadding);
        return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    } catch  {
        return null;
    }
}
function extractCodexAccountInfo(idToken) {
    const payload = decodeJwtPayload(idToken);
    if (!payload) return {};
    const chatgpt = payload["https://api.openai.com/auth"] || {};
    return {
        email: typeof payload.email === "string" ? payload.email : undefined,
        chatgptAccountId: typeof chatgpt.chatgpt_account_id === "string" ? chatgpt.chatgpt_account_id : undefined,
        chatgptPlanType: typeof chatgpt.chatgpt_plan_type === "string" ? chatgpt.chatgpt_plan_type : undefined
    };
}
function decodeJwtExp(jwt) {
    const payload = decodeJwtPayload(jwt);
    const exp = payload && typeof payload.exp === "number" ? payload.exp : null;
    return exp !== null && Number.isFinite(exp) ? exp : null;
}
function pickString(...candidates) {
    for (const c of candidates){
        if (typeof c === "string" && c.trim()) return c.trim();
    }
    return undefined;
}
function parseExpiry(value) {
    if (typeof value === "string" && value) {
        const ms = Date.parse(value);
        if (Number.isFinite(ms)) return new Date(ms).toISOString();
    }
    return undefined;
}
function parseAccessTokenExp(accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const exp = payload && typeof payload.exp === "number" ? payload.exp : null;
    if (exp && Number.isFinite(exp)) {
        return new Date(exp * 1000).toISOString();
    }
    return new Date(Date.now() + DEFAULT_EXPIRY_MS).toISOString();
}
/**
 * Codex CLI persists tokens to `auth.json` with the OAuth fields nested under
 * a `tokens` object: `{ auth_mode, OPENAI_API_KEY, tokens: { id_token, ... } }`.
 * Flatten that into the same shape as a simple top-level export so the rest of
 * the normalizer can stay unchanged.
 */ function unwrapCodexAuthJson(rec) {
    const tokens = rec.tokens;
    if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
        return rec;
    }
    if (typeof tokens.access_token !== "string") return rec;
    // Tokens take priority; carry through siblings (email / account_id / expired)
    // only when the nested object doesn't already define them.
    return {
        ...rec,
        ...tokens
    };
}
/**
 * Map the camelCase field names used by 9router's Codex account export
 * (`accessToken`, `refreshToken`, `idToken`, `expiresAt`, and a nested
 * `providerSpecificData` block) onto the snake_case keys the rest of the
 * normalizer already understands (#6665). A snake_case key is only filled from
 * its camelCase alias when it is absent, so a snake_case or mixed export keeps
 * working unchanged.
 */ function applyCamelCaseAliases(rec) {
    const out = {
        ...rec
    };
    const fillFrom = (snake, value)=>{
        if (out[snake] === undefined && typeof value === "string" && value) {
            out[snake] = value;
        }
    };
    fillFrom("access_token", rec.accessToken);
    fillFrom("refresh_token", rec.refreshToken);
    fillFrom("id_token", rec.idToken);
    fillFrom("expired", rec.expiresAt);
    const psd = rec.providerSpecificData;
    if (psd && typeof psd === "object" && !Array.isArray(psd)) {
        const block = psd;
        fillFrom("account_id", block.chatgptAccountId);
        fillFrom("chatgpt_plan_type", block.chatgptPlanType);
    }
    return out;
}
function normalizeCodexImportRecord(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return {
            ok: false,
            error: "Record is not an object"
        };
    }
    const rec = applyCamelCaseAliases(unwrapCodexAuthJson(input));
    // Allow type field to be missing or "codex"; reject anything else explicitly so
    // users don't accidentally import claude/gemini exports through this path.
    if (rec.type !== undefined && rec.type !== null && rec.type !== "codex") {
        return {
            ok: false,
            error: `Unsupported type: ${String(rec.type)}`
        };
    }
    for (const f of REQUIRED_FIELDS){
        if (typeof rec[f] !== "string" || !rec[f]) {
            return {
                ok: false,
                error: `Missing required field: ${f}`
            };
        }
    }
    const accessToken = String(rec.access_token);
    const refreshToken = String(rec.refresh_token);
    const idToken = typeof rec.id_token === "string" ? rec.id_token : undefined;
    // Prefer JWT-derived account info, fall back to top-level fields.
    const fromJwt = idToken ? extractCodexAccountInfo(idToken) : {};
    const email = pickString(fromJwt.email, rec.email);
    if (!email) {
        return {
            ok: false,
            error: "Missing email (and id_token does not contain one)"
        };
    }
    const chatgptAccountId = pickString(fromJwt.chatgptAccountId, rec.account_id);
    const chatgptPlanType = pickString(fromJwt.chatgptPlanType, rec.chatgpt_plan_type);
    const expiresAt = parseExpiry(rec.expired) ?? parseAccessTokenExp(accessToken);
    const providerSpecificData = {};
    if (chatgptAccountId) providerSpecificData.chatgptAccountId = chatgptAccountId;
    if (chatgptPlanType) providerSpecificData.chatgptPlanType = chatgptPlanType;
    const payload = {
        provider: "codex",
        authType: "oauth",
        accessToken,
        refreshToken,
        email,
        expiresAt,
        testStatus: "active"
    };
    if (idToken) payload.idToken = idToken;
    if (Object.keys(providerSpecificData).length > 0) {
        payload.providerSpecificData = providerSpecificData;
    }
    return {
        ok: true,
        payload
    };
}
function flattenCodexImportPayload(parsed) {
    if (Array.isArray(parsed)) {
        return {
            ok: true,
            records: parsed
        };
    }
    if (parsed && typeof parsed === "object") {
        return {
            ok: true,
            records: [
                parsed
            ]
        };
    }
    return {
        ok: false,
        error: "JSON must be an object or an array of objects"
    };
}
}),
"[project]/src/lib/oauth/utils/codexSessionImport.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "looksLikeCodexSessionJson",
    ()=>looksLikeCodexSessionJson,
    "parseCodexSessionJson",
    ()=>parseCodexSessionJson
]);
/**
 * Codex (OpenAI) session-JSON normalizer
 *
 * Accepts the raw JSON object copied straight from
 * `https://chatgpt.com/api/auth/session` (`{ user: {...}, accessToken, expires }`,
 * NextAuth's session-endpoint shape) and extracts a bare access token + optional
 * email, the same credential type already accepted by the bare-token import path
 * (`POST /api/oauth/codex/import-token`, #1290) — this module only widens what
 * shapes of pasted input can reach that endpoint.
 *
 * Pure: no I/O, no network, no DB import. Safe to unit-test. Mirrors the style
 * of `codexAuthImport.ts` / `codexImport.ts`, deliberately kept separate from
 * both: the bulk `auth.json` import requires a `refresh_token`; this path is
 * for a bare access token and deliberately does not.
 *
 * Ref: #6636
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$services$2f$codexImport$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/services/codexImport.ts [app-ssr] (ecmascript)");
;
// ── Internal helpers ──────────────────────────────────────────────────────────
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function toNonEmptyString(value) {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
/** Looks like a JWT (3 dot-separated segments) — a loose shape check only. */ function looksLikeJwt(value) {
    return value.split(".").length === 3;
}
/**
 * Field-name aliases for the access token across known Codex/ChatGPT session
 * export shapes: the literal `accessToken` returned by `chatgpt.com/api/auth/session`
 * first, then snake_case and alternate names, then the same aliases nested one
 * level under `tokens` (mirrors `unwrapCodexAuthJson` in `codexAuthImport.ts`).
 */ function findAccessToken(rec) {
    const direct = toNonEmptyString(rec.accessToken) || toNonEmptyString(rec.access_token) || toNonEmptyString(rec.sessionToken) || toNonEmptyString(rec.session_token);
    if (direct) return direct;
    const nested = toRecord(rec.tokens);
    if (!nested) return undefined;
    return toNonEmptyString(nested.access_token) || toNonEmptyString(nested.accessToken);
}
/** True when either expiry signal (top-level `expires` ISO string, or JWT `exp`) is in the past. */ function isExpired(rec, accessToken) {
    const expiresField = toNonEmptyString(rec.expires);
    if (expiresField) {
        const ms = Date.parse(expiresField);
        if (Number.isFinite(ms) && ms <= Date.now()) return true;
    }
    const exp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$services$2f$codexImport$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeJwtExp"])(accessToken);
    return exp !== null && exp * 1000 <= Date.now();
}
function looksLikeCodexSessionJson(value) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed.startsWith("{")) return false;
    try {
        return toRecord(JSON.parse(trimmed)) !== null;
    } catch  {
        return false;
    }
}
function parseCodexSessionJson(raw) {
    const rec = toRecord(raw);
    if (!rec) {
        return {
            ok: false,
            error: "Pasted session data is not a JSON object"
        };
    }
    const accessToken = findAccessToken(rec);
    if (!accessToken) {
        return {
            ok: false,
            error: "Could not find an access token field in the pasted session JSON (expected accessToken, access_token, sessionToken, or tokens.access_token)"
        };
    }
    if (!looksLikeJwt(accessToken)) {
        return {
            ok: false,
            error: "The access token field does not look like a valid JWT"
        };
    }
    if (isExpired(rec, accessToken)) {
        return {
            ok: false,
            error: "Session is expired — sign in to chatgpt.com again and re-copy the session JSON"
        };
    }
    const user = toRecord(rec.user);
    const email = user && toNonEmptyString(user.email) || undefined;
    return {
        ok: true,
        session: {
            accessToken,
            email
        }
    };
}
}),
"[project]/src/lib/oauth/utils/grokCliAuthJson.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Grok Build (grok-cli) paste-import validation (#7610).
 *
 * The paste-token import path used to accept a bare JWT ("key" field only),
 * which creates a connection with refresh_token=null that can never
 * auto-refresh and dies at expiry. This module requires the full
 * ~/.grok/auth.json object (validating that a refresh_token is present
 * somewhere in it) before the paste is accepted.
 *
 * Extracted from OAuthModal.tsx so it can be unit-tested directly (and to
 * keep the frozen file-size gate on OAuthModal.tsx from growing).
 */ __turbopack_context__.s([
    "parseGrokCliPasteToken",
    ()=>parseGrokCliPasteToken
]);
function parseGrokCliPasteToken(raw) {
    const trimmed = raw.trim();
    if (!trimmed) {
        return {
            ok: false,
            error: "Paste the full contents of ~/.grok/auth.json"
        };
    }
    // Full auth.json object (preferred — includes refresh_token).
    if (trimmed.startsWith("{")) {
        try {
            const parsed = JSON.parse(trimmed);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                return {
                    ok: false,
                    error: "auth.json must be a JSON object from ~/.grok/auth.json"
                };
            }
            const doc = parsed;
            let hasKey = false;
            let hasRefresh = false;
            for (const entry of Object.values(doc)){
                if (!entry || typeof entry !== "object") continue;
                const obj = entry;
                if (typeof obj.key === "string" && obj.key.startsWith("eyJ")) {
                    hasKey = true;
                    if (typeof obj.refresh_token === "string" && obj.refresh_token.length > 0) {
                        hasRefresh = true;
                        break;
                    }
                }
                if (typeof obj.access_token === "string" && obj.access_token.startsWith("eyJ")) {
                    hasKey = true;
                    if (typeof obj.refresh_token === "string" && obj.refresh_token.length > 0) {
                        hasRefresh = true;
                        break;
                    }
                }
            }
            if (!hasKey) {
                return {
                    ok: false,
                    error: 'Could not find a Grok Build JWT ("key") in the pasted auth.json. Run `grok login` and paste the full file.'
                };
            }
            if (!hasRefresh) {
                return {
                    ok: false,
                    error: "auth.json is missing refresh_token. Re-run `grok login` and paste the full ~/.grok/auth.json so the connection can auto-refresh (#7610)."
                };
            }
            return {
                ok: true,
                token: doc
            };
        } catch  {
            return {
                ok: false,
                error: "Could not parse auth.json. Paste the full JSON from ~/.grok/auth.json."
            };
        }
    }
    // Bare JWT — deliberately rejected so connections are not created without refresh_token.
    if (trimmed.startsWith("eyJ")) {
        return {
            ok: false,
            error: 'Do not paste only the JWT "key" field. Paste the full ~/.grok/auth.json object so refresh_token is included (#7610).'
        };
    }
    return {
        ok: false,
        error: "Paste the full contents of ~/.grok/auth.json (JSON object)."
    };
}
}),
"[project]/src/lib/oauth/utils/loopbackTunnel.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared bits for the two loopback-mismatch hints surfaced by OAuthModal.
 *
 * Both families break for the same underlying reason — the dashboard is reached at a
 * LAN address, so the `localhost`/`127.0.0.1` the provider redirects to belongs to the
 * machine running the browser rather than to the OmniRoute server — but they differ in
 * which ports are involved and in what the remedy is:
 *
 * - `pkceLoopbackWarning.ts` (codex / xai-oauth / grok-cli): a FIXED foreign port
 *   registered with the upstream OAuth app, so the dashboard port AND that port must
 *   both be forwarded.
 * - `googleLoopbackHint.ts` (antigravity / agy): the callback rides the dashboard port
 *   itself, so one forward suffices — and Google's firstparty consent hangs instead of
 *   redirecting, which is why a local login helper exists at all.
 */ __turbopack_context__.s([
    "buildSshLocalForward",
    ()=>buildSshLocalForward,
    "resolveDashboardPort",
    ()=>resolveDashboardPort
]);
function resolveDashboardPort(location) {
    if (location.port) return location.port;
    return location.protocol === "https:" ? "443" : "80";
}
function buildSshLocalForward(ports, hostname) {
    const unique = [
        ...new Set(ports)
    ];
    return `ssh ${unique.map((p)=>`-L ${p}:127.0.0.1:${p}`).join(" ")} <user>@${hostname}`;
}
}),
"[project]/src/lib/oauth/utils/googleLoopbackHint.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildGoogleLoopbackHint",
    ()=>buildGoogleLoopbackHint
]);
/**
 * Structured guidance for Google-loopback providers (antigravity / agy) reached from a
 * non-true-localhost origin.
 *
 * Unlike the codex family, these providers have no fixed foreign port — OAuthModal
 * builds `http://127.0.0.1:<dashboardPort>/callback`. On a LAN origin that 127.0.0.1 is
 * the *browser's* machine, and Google's `firstparty/nativeapp` consent only releases the
 * authorization code once that loopback is reachable from the approving browser. When it
 * is not, the consent screen **never redirects at all** — it simply hangs.
 *
 * That is what made the previous copy actively misleading: it told the operator to wait
 * for the redirect and paste the callback URL, but no redirect arrives and there is
 * nothing to paste. Hence the two real remedies surfaced here:
 *
 * 1. the local login helper, which runs the OAuth on the operator's own machine (where
 *    127.0.0.1 works) and prints a credential blob the Step 2 field accepts;
 * 2. an SSH forward of the dashboard port, after which the callback reaches the server.
 *
 * See docs/guides/REMOTE-MODE.md → "Connecting Antigravity on a remote install".
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/utils/loopbackTunnel.ts [app-ssr] (ecmascript)");
;
/**
 * Providers the `omniroute login <provider>` helper can mint a blob for.
 *
 * `bin/cli/commands/login.mjs` pins `PROVIDER = "antigravity"`, and
 * `parsePastedCredentials()` refuses a blob whose embedded provider does not match the
 * route provider — so advertising the helper on the `agy` dialog would send the operator
 * to a blob that is guaranteed to be rejected. `agy` may still paste a blob, it just has
 * no CLI that produces one, so it gets the tunnel path only.
 */ const LOGIN_HELPER_PROVIDERS = new Set([
    "antigravity"
]);
function buildGoogleLoopbackHint(provider, location) {
    const dashboardPort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDashboardPort"])(location);
    return {
        provider,
        redirectUri: `http://127.0.0.1:${dashboardPort}/callback`,
        dashboardHost: location.hostname,
        dashboardPort,
        // One forward only: the callback rides the dashboard port itself.
        tunnelCommand: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildSshLocalForward"])([
            dashboardPort
        ], location.hostname),
        localDashboardUrl: `http://localhost:${dashboardPort}`,
        helperCommand: LOGIN_HELPER_PROVIDERS.has(provider) ? `npx omniroute login ${provider}` : null
    };
}
}),
"[project]/src/lib/oauth/utils/pkceLoopbackWarning.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildPkceLoopbackMismatchHint",
    ()=>buildPkceLoopbackMismatchHint,
    "buildPkceLoopbackMismatchWarning",
    ()=>buildPkceLoopbackMismatchWarning
]);
/**
 * #8046: PKCE_CALLBACK_SERVER_PROVIDERS (codex/xai-oauth/grok-cli) register a FIXED
 * loopback redirect_uri (e.g. http://localhost:1455/auth/callback for codex) with the
 * upstream OAuth app. That redirect only resolves on the machine actually running the
 * browser, not on whatever host serves the OmniRoute dashboard.
 *
 * OAuthModal's `isTrueLocalhost` check (hostname === "localhost" || "127.0.0.1") only
 * covers one such case. A dashboard reached via a LAN IP (192.168.*, 10.*, 172.16-31.*)
 * is `isLocalhost: true, isTrueLocalhost: false` — the callback-server branch was falling
 * straight through to the standard authorize flow and window.open()ing an authUrl whose
 * embedded redirect_uri can never resolve, with zero warning (reported as a silent
 * Auth0 `invalid_state` failure with no server-side log line).
 *
 * Extracted out of OAuthModal.tsx (frozen file-size baseline) so the guard has an
 * isolated, unit-testable home. Mirrors the messaging pattern of the sibling
 * remote-origin hint added for #7523 (`remoteOAuthHint.ts::buildRemoteOAuthHint`).
 *
 * Follow-up: the guard stops the doomed flow correctly, but explaining it as one long
 * sentence in the generic red error step left the operator to work out *which* ports to
 * forward. `buildPkceLoopbackMismatchHint()` returns the same diagnosis as structured
 * data — including a copy-pasteable `ssh -L` command with the detected host and both
 * ports already filled in — so the modal can render an organized panel instead.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/utils/loopbackTunnel.ts [app-ssr] (ecmascript)");
;
const PKCE_LOOPBACK_REDIRECT_HINT = {
    codex: "http://localhost:1455/auth/callback",
    "xai-oauth": "http://127.0.0.1:56121/callback",
    "grok-cli": "http://127.0.0.1:56122/callback"
};
/** Ports the upstream OAuth apps hardcode; kept in sync with OAuthModal's redirectUri branch. */ const PKCE_LOOPBACK_CALLBACK_PORT = {
    codex: 1455,
    "xai-oauth": 56121,
    "grok-cli": 56122
};
function buildPkceLoopbackMismatchHint(provider, location) {
    const dashboardPort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDashboardPort"])(location);
    const callbackPort = PKCE_LOOPBACK_CALLBACK_PORT[provider] ?? null;
    const forwards = [
        dashboardPort
    ];
    if (callbackPort != null && String(callbackPort) !== dashboardPort) {
        forwards.push(String(callbackPort));
    }
    return {
        provider,
        redirectUri: PKCE_LOOPBACK_REDIRECT_HINT[provider] ?? "a fixed localhost callback URL",
        callbackPort,
        dashboardPort,
        dashboardHost: location.hostname,
        tunnelCommand: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildSshLocalForward"])(forwards, location.hostname),
        localDashboardUrl: `http://localhost:${dashboardPort}`
    };
}
function buildPkceLoopbackMismatchWarning(provider) {
    const redirect = PKCE_LOOPBACK_REDIRECT_HINT[provider] ?? "a fixed localhost callback URL";
    return `OmniRoute is being accessed from a LAN IP, not true localhost. ${provider}'s OAuth app ` + `is registered with a fixed loopback redirect (${redirect}) that only resolves on the ` + "machine running this browser tab, not on the OmniRoute server — the login will silently " + "fail on the provider's side. Open the OmniRoute dashboard from true localhost instead " + "(SSH port-forward: ssh -L <port>:127.0.0.1:<port> <user>@<omniroute-host>, then browse to " + "http://localhost:<port>), or use the token-import flow for this provider if available.";
}
}),
"[project]/src/lib/oauth/gitlab.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/providers/managedAvailableModels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "compatibleProviderSupportsModelImport",
    ()=>compatibleProviderSupportsModelImport,
    "getCompatibleFallbackModels",
    ()=>getCompatibleFallbackModels
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/models.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function getCompatibleFallbackModels(providerId, fallbackModels = []) {
    if (providerId === "openrouter") return fallbackModels;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getModelsByProviderId"])("claude");
    return undefined;
}
function compatibleProviderSupportsModelImport(providerId) {
    return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/oauth/kiroSocialPoll.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "classifyKiroSocialPoll",
    ()=>classifyKiroSocialPoll,
    "getNextKiroSocialPollInterval",
    ()=>getNextKiroSocialPollInterval
]);
function getNextKiroSocialPollInterval(currentIntervalMs, error) {
    return error === "slow_down" ? currentIntervalMs + 5000 : currentIntervalMs;
}
function errorCode(value) {
    return typeof value === "string" && value.trim() ? value.trim() : "authorization_failed";
}
function classifyKiroSocialPoll(responseOk, responseStatus, data) {
    if (data.error === "authorization_pending" || data.error === "slow_down") {
        return {
            kind: "pending",
            error: data.error
        };
    }
    if (!responseOk || data.error) {
        const status = responseStatus >= 400 && responseStatus <= 599 ? responseStatus : 400;
        return {
            kind: "error",
            error: errorCode(data.error),
            status
        };
    }
    if (!data.accessToken && !data.refreshToken) {
        return {
            kind: "error",
            error: "invalid_token_response",
            status: 502
        };
    }
    return {
        kind: "success"
    };
}
}),
"[project]/src/domain/connectionModelRules.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionExcludedModels",
    ()=>getConnectionExcludedModels,
    "hasEligibleConnectionForModel",
    ()=>hasEligibleConnectionForModel,
    "isModelExcludedByConnection",
    ()=>isModelExcludedByConnection,
    "normalizeExcludedModelPatterns",
    ()=>normalizeExcludedModelPatterns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wildcardRouter.ts [app-ssr] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizePattern(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    if (!normalized || normalized === "**") return null;
    return normalized;
}
function toPatternList(value) {
    if (Array.isArray(value)) {
        return value.map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    if (typeof value === "string") {
        return value.split(",").map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    return [];
}
function uniquePatterns(patterns) {
    return Array.from(new Set(patterns));
}
function getModelMatchCandidates(modelId) {
    const normalized = modelId.trim();
    if (!normalized) return [];
    const withoutExtendedContext = normalized.endsWith("[1m]") ? normalized.slice(0, -4) : normalized;
    const lastSlashIndex = withoutExtendedContext.lastIndexOf("/");
    const rawModel = lastSlashIndex >= 0 ? withoutExtendedContext.slice(lastSlashIndex + 1) : withoutExtendedContext;
    return Array.from(new Set([
        normalized,
        withoutExtendedContext,
        rawModel
    ].filter(Boolean)));
}
function normalizeExcludedModelPatterns(value) {
    return uniquePatterns(toPatternList(value));
}
function getConnectionExcludedModels(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeExcludedModelPatterns(data.excludedModels ?? data.excluded_models);
}
function isModelExcludedByConnection(modelId, providerSpecificData) {
    if (typeof modelId !== "string" || modelId.trim().length === 0) return false;
    const candidates = getModelMatchCandidates(modelId);
    const excludedModels = getConnectionExcludedModels(providerSpecificData);
    if (candidates.length === 0 || excludedModels.length === 0) return false;
    return excludedModels.some((pattern)=>candidates.some((candidate)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wildcardMatch"])(candidate, pattern)));
}
function hasEligibleConnectionForModel(connections, modelId) {
    if (!Array.isArray(connections) || connections.length === 0) return false;
    return connections.some((connection)=>!isModelExcludedByConnection(modelId, connection?.providerSpecificData));
}
}),
"[project]/src/store/emailPrivacyStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
"use client";
;
;
const useEmailPrivacyStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        emailsVisible: false,
        setEmailsVisible: (visible)=>set({
                emailsVisible: visible
            })
    }), {
    name: "omniroute-email-privacy"
}));
const __TURBOPACK__default__export__ = useEmailPrivacyStore;
}),
"[project]/src/store/notificationStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNotificationStore",
    ()=>useNotificationStore
]);
/**
 * Notification Store — FASE-07 UX & Microinteractions
 *
 * Zustand-based global notification system for the dashboard.
 * Replaces ad-hoc feedback patterns with a centralized toast system.
 *
 * @module store/notificationStore
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
"use client";
;
let idCounter = 0;
const useNotificationStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        notifications: [],
        addNotification: (notification)=>{
            const id = ++idCounter;
            const entry = {
                id,
                type: notification.type || "info",
                message: notification.message,
                title: notification.title || null,
                duration: notification.duration ?? 5000,
                dismissible: notification.dismissible ?? true,
                createdAt: Date.now(),
                onClick: notification.onClick
            };
            set((s)=>({
                    notifications: [
                        ...s.notifications,
                        entry
                    ]
                }));
            // Auto-dismiss
            if (entry.duration > 0) {
                setTimeout(()=>{
                    get().removeNotification(id);
                }, entry.duration);
            }
            return id;
        },
        removeNotification: (id)=>{
            set((s)=>({
                    notifications: s.notifications.filter((n)=>n.id !== id)
                }));
        },
        clearAll: ()=>set({
                notifications: []
            }),
        // ─── Convenience Methods ─────────────────
        success: (message, title)=>get().addNotification({
                type: "success",
                message,
                title
            }),
        error: (message, title)=>get().addNotification({
                type: "error",
                message,
                title,
                duration: 8000
            }),
        warning: (message, title)=>get().addNotification({
                type: "warning",
                message,
                title,
                duration: 10000
            }),
        info: (message, title)=>get().addNotification({
                type: "info",
                message,
                title
            })
    }));
}),
];

//# sourceMappingURL=src_1elodue._.js.map